export interface ILocationData {
    x: number;
    y: number;
}

export interface ILocationUpdatedEvent {
    location: ILocationData;
}

export interface ICreateGameEvent {
    //TODO: does the create room event come with the generated map?
    name: string;
}

export interface IJoinGameEvent {
    name: string;
}

export class Events {
    public static CREATE_GAME = 'create-game';
    public static JOIN_GAME = 'join-game';
    public static UPDATE_LOCATION = 'update-location';
}