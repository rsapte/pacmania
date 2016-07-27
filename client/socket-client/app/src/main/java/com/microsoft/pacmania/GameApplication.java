package com.microsoft.pacmania;

import android.app.Application;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;

/**
 * Created by rsapt_000 on 7/26/2016.
 */
public class GameApplication  extends Application {
    private Socket mSocket;
    private Emitter.Listener onUpdateGameState;

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
        mSocket.disconnect();
        mSocket.off(Events.UPDATE_GAME_STATE, this.onUpdateGameState);
    }

    public void setEventHandlers(Emitter.Listener onUpdateGameState) {
        if(this.onUpdateGameState != null) {
            mSocket.off(Events.UPDATE_GAME_STATE, this.onUpdateGameState);
        }
        this.onUpdateGameState = onUpdateGameState;
    }

    public Socket getSocket() {
        if(mSocket != null) {
            return mSocket;
        }

        try {
            mSocket = IO.socket(getString(R.string.socket_server));
            // setup socket
            mSocket.on(Events.UPDATE_GAME_STATE, onUpdateGameState);
            mSocket.connect();
            return mSocket;
        } catch (URISyntaxException e) {
            return null;
        }
    }
}
