#!/bin/bash

echo "Stopping MediBox services..."

screen -X -S ml quit
screen -X -S frontend quit
screen -X -S backend quit

echo "All services stopped."
