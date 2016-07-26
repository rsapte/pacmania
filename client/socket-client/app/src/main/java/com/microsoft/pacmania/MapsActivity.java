package com.microsoft.pacmania;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.support.v4.content.ContextCompat;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.gson.Gson;

import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.Random;


public class MapsActivity extends FragmentActivity implements LocationListener, OnMapReadyCallback {

    private GoogleMap mMap;
    private LocationManager mLocationManager;
    private Socket mSocket;

    private boolean mInitialized = false;
    private Emitter.Listener onUpdateGameState;

    private static final long MIN_TIME = 400;
    private static final float MIN_DISTANCE = 1000;
    private static final double BOUNDING_BOX_DIM = 1/68;
    private static Random random = new Random();
    private static Gson jsonSerializer = new Gson();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        onUpdateGameState = new Emitter.Listener() {
            @Override
            public void call(final Object... args) {
                if(mMap == null) {
                    return;
                }

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        JSONObject data = (JSONObject)args[0];
                        String str = data.toString();
                        UpdateGameStateEvent event = jsonSerializer.fromJson(str, UpdateGameStateEvent.class);
                        mMap.clear();
                        // place markers for sprites

                        if(event.pacman != null) {
                            LatLng pos = new LatLng(event.pacman.location.y, event.pacman.location.x);
                            mMap.addMarker(new MarkerOptions()
                                    .title("Pacman")
                                    .position(pos));
                        }

                        for (Player ghost :
                                event.ghosts) {
                            LatLng pos = new LatLng(ghost.location.y, ghost.location.x);
                            mMap.addMarker(new MarkerOptions()
                                    .title("Ghost")
                                    .position(pos));
                        }

                        for (Fruit fruit :
                                event.fruits) {
                            LatLng pos = new LatLng(fruit.location.y, fruit.location.x);
                            mMap.addMarker(new MarkerOptions()
                                    .title("Fruit")
                                    .position(pos));
                        }
                    }
                });

            }
        };

        initializeSocket();


        setContentView(R.layout.activity_maps);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        // ask for location updates
        if(ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            int permissionCheck = ContextCompat.checkSelfPermission(this,
                    android.Manifest.permission.ACCESS_FINE_LOCATION);
            if(permissionCheck != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }

        if(ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            int permissionCheck = ContextCompat.checkSelfPermission(this,
                    Manifest.permission.ACCESS_COARSE_LOCATION);
            if(permissionCheck != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }

        mLocationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        /*if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }*/
        mLocationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, MIN_TIME, MIN_DISTANCE, this);
    }


    private void initializeSocket() {
        try {
            mSocket = IO.socket(getString(R.string.socket_server));
            // setup socket
            mSocket.on(Events.UPDATE_GAME_STATE, onUpdateGameState);
            mSocket.connect();
        } catch (URISyntaxException e) {
        }
    }
    @Override
    public void onLocationChanged(Location location) {
        if(!mInitialized) {
            if(mMap != null) {
                InitPlayerEvent event = createInitPlayerEvent(location);
                String e = toJson(event);
                mSocket.emit(Events.INIT_PLAYER, e);
                mInitialized = true;
            }
        }
        else {
            UpdateLocationEvent event = createUpdateLocationEvent(location);
            mSocket.emit(Events.UPDATE_LOCATION, toJson(event));
        }
    }

    private String toJson(Object event) {
        return jsonSerializer.toJson(event);
    }

    private UpdateLocationEvent createUpdateLocationEvent(Location location) {
        UpdateLocationEvent event = new UpdateLocationEvent();
        event.location = new LocationData(location.getLongitude(), location.getLatitude());
        return event;
    }

    private InitPlayerEvent createInitPlayerEvent(Location location) {
        InitPlayerEvent event = new InitPlayerEvent();
        event.player = new Player();
        event.player.location = new LocationData(location.getLongitude(), location.getLatitude());

        double boxWidth = BOUNDING_BOX_DIM / 2;
        double north = Math.min(90, location.getLatitude() + boxWidth);
        double south = Math.max(-90, location.getLatitude() - boxWidth);
        double east = Math.min(180, location.getLongitude() + boxWidth);
        double west = Math.max(-180, location.getLongitude() - boxWidth);

        event.fruits = new Fruit[] {
                new Fruit(random.nextInt(100), "Apple", generateLocation(north, south, east, west)),
                new Fruit(random.nextInt(100), "Banana", generateLocation(north, south, east, west)),
                new Fruit(random.nextInt(100), "Orange", generateLocation(north, south, east, west)),
                new Fruit(random.nextInt(100), "Grape", generateLocation(north, south, east, west)),
        };

        return event;
    }

    private LocationData generateLocation(double north, double south, double east, double west) {
        LocationData location = new LocationData(
                west + random.nextDouble() * (east - west),
                south + random.nextDouble() * (north - south));
        return location;
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) { }

    @Override
    public void onProviderEnabled(String provider) { }

    @Override
    public void onProviderDisabled(String provider) { }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mSocket.disconnect();
        mSocket.off(Events.UPDATE_GAME_STATE, onUpdateGameState);
    }
}
