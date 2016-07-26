package com.microsoft.pacmania;

/**
 * Created by rsapt_000 on 7/26/2016.
 */
public class UpdateGameStateEvent {
    public Player pacman;
    public Player[] ghosts;
    public Fruit[] fruits;
    public GameState state;
}
