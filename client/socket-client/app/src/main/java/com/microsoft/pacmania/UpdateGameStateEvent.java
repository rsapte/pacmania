package com.microsoft.pacmania;

/**
 * Created by rsapt_000 on 7/26/2016.
 */
public class UpdateGameStateEvent {
    public Player Pacman;
    public Player[] Ghosts;
    public Fruit[] Fruits;
    public GameState State;
}
