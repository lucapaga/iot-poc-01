# linka o copia il file /home/pi/iot-poc-01/device/pubsub/lucapaga-pubsub-py.service dentro /lib/systemd/system/

sudo cp /home/pi/iot-poc-01/device/pubsub/lucapaga-pubsub-py.service /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/lucapaga-pubsub-py.service

sudo systemctl daemon-reload
sudo systemctl enable lucapaga-pubsub-py.service

echo ""
echo ""
echo "********************************************"
echo " ALL DONE, NOW YOU CAN REBOOT"
echo ""
echo "Then please run 'sudo journalctl -u  lucapaga-pubsub-py.service'"
echo "********************************************"
echo ""
echo ""
