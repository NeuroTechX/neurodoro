package com.neurodoro.signal;

import android.graphics.Canvas;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.NoSuchElementException;
import java.util.concurrent.locks.ReentrantReadWriteLock;


// AndroidPlot class that stores data to be plotted. getX() and getY() are called by XYPlot to to draw graph
// This implementation only stores Y values, with X values implicitily determined by the index of the data in the LinkedList
public class DynamicSeries {

    // -------------------------------------------------------------
    // Variables
    private String title;
    private volatile LinkedList<Number> yVals = new LinkedList<Number>();
    private ReentrantReadWriteLock lock = new ReentrantReadWriteLock(true);

    // -------------------------------------------------------------
    // Constructor
    public DynamicSeries(String title) {
        this.title = title;
    }

    // --------------------------------------------------------------
    // Data Series Methods


    public String getTitle() {
        return title;
    }


    public int size() {
        return yVals != null ? yVals.size() : 0;
    }


    public Number getX(int index) {
        return index;
    }


    public Number getY(int index) {
        return yVals.get(index);
    }


    public void addLast(Number y) {
        lock.writeLock().lock();
        try {
            yVals.addLast(y);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void addAll(Number[] y) {
        lock.writeLock().lock();
        try {
            yVals.addAll(Arrays.asList(y));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void removeFirst() {
        lock.writeLock().lock();
        try {
            if (size() <= 0) {
                throw new NoSuchElementException();
            }
            yVals.removeFirst();
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void clear() {
        lock.writeLock().lock();
        try {
            yVals.clear();
        } finally {
            lock.writeLock().unlock();
        }
    }
}