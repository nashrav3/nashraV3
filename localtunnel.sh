#!/bin/bash 
until lt --port 8010 --subdomain nashrabot
do
  echo "Try again"
done