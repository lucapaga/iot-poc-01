#!flask/bin/python
import sys, os
import argparse
import time
from json import JSONDecoder

from google.cloud import pubsub_v1
from gpiozero import LED, Button


def create_subscription(project, topic_name, subscription_name, client):
    subscriber = client
    topic_path = subscriber.topic_path(project, topic_name)
    subscription_path = subscriber.subscription_path(
        project, subscription_name)
    subscription = subscriber.create_subscription(
        subscription_path, topic_path)
    print('Subscription created: {}'.format(subscription))


def delete_subscription(project, subscription_name, client):
    subscriber = client
    subscription_path = subscriber.subscription_path(
        project, subscription_name)
    subscriber.delete_subscription(subscription_path)
    print('Subscription deleted: {}'.format(subscription_path))


def publish_message(project, topic_name, message, client=None):
#    publisher = pubsub_v1.PublisherClient()
    publisher = client
    if publisher == None:
        publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project, topic_name)
    data = u'{}'.format(message)
    data = data.encode('utf-8')
    publisher.publish(topic_path, data=data)
    print('Published messages.')


def on_pubsub_message(message):
    try:
        print('Received COMMAND: {}'.format(message))
        aCommand = JSONDecoder().decode(message.data)
        print("Serialized version: {}".format(aCommand))

        target_device_id = None
        try:
            target_device_id = aCommand["device_id"]
        except Exception as e:
            print("'device_id' is invalid or undefined (ERROR: {})".format(e))

        target_gpio_pin = None
        try:
            target_gpio_pin = int(aCommand["gpio_pin"])
        except Exception as e:
            print("'gpio_pin' is invalid or undefined (ERROR: {})".format(e))

        target_action = None
        try:
            target_action = aCommand["action"]
        except Exception as e:
            print("'action' is invalid or undefined (ERROR: {})".format(e))

        target_color = None
        try:
            target_color = aCommand["led_color"]
        except Exception as e:
            print("'led_color' is invalid or undefined (ERROR: {})".format(e))

        message_ts = None
        try:
            message_ts = int(aCommand["ts"])
        except Exception as e:
            print("'ts' is invalid or undefined (ERROR: {})".format(e))

        if target_device_id == None:
            print("Command is not targeted to any device, discarding action")
            return
        elif target_device_id != reference_device_id:
            print("This command is not for me!")
            return
        else:
            print("This command is FOR ME! Proceeding ...")

        if message_ts != None:
            print("Checking message age ...")
            now_in_millis = int(round(time.time() * 1000))
            print("Now is {}".format(now_in_millis))
            time_diff_s = (now_in_millis - message_ts) / 1000
            if now_in_millis - message_ts > message_max_ttl:
                time_diff_s = (now_in_millis - message_ts) / 1000
                print("Message is expired (timestamp: {}, diff: {} s), acking and no action".format(message_ts, time_diff_s))
                message.ack()
                return
            else:
                print("This message is still valid ({} s), processing!".format(time_diff_s))
        else:
            print("Message's timestamp value is not available, age check can't be performed, proceeding as valid")

        print(" - LED COLOR: {}".format(target_color))
        print(" -    ACTION: {}".format(target_action))

        theLED = None

        if target_gpio_pin != None and target_gpio_pin > 0:
            print("Explicit GPIO PIN number addressing: {}".format(target_gpio_pin))
            if target_gpio_pin == my_green_led_pin:
                print("GPIO PIN is for the RED LED")
                theLED = green_led
            elif target_gpio_pin == my_red_led_pin:
                print("GPIO PIN is for the RED LED")
                theLED = red_led
            else:
                if EMULATE != True:
                    print("GPIO PIN is not 'well-known', trying with new instantiation")
                    theLED = LED(target_gpio_pin)
        else:
            print("GPIO PIN is not explicitly addressed, checking LED selector value")
            if target_color.lower() == "green":
                theLED = green_led
                print("Working on GREEN led")
            elif target_color.lower() == "red":
                theLED = red_led
                print("Working on RED led")
            elif target_color.lower() == "light-bulb":
                theLED = light_bulb
                print("Working on LIGHT BULB")
            else:
                print("Unkown LED color: {}".format(target_color))

        if theLED != None:
            if target_action == "light-on":
                print("Switching the LED on")
                if EMULATE != True:
                    if target_color != None and target_color.lower() == "light-bulb":
                        theLED.off()
                    else:
                        theLED.on()
            elif target_action == "light-off":
                print("Switching the LED off")
                if EMULATE != True:
                    if target_color != None and target_color.lower() == "light-bulb":
                        theLED.on()
                    else:
                        theLED.off()
            else:
                print("Unkown ACTION: {}".format(target_action))
        else:
            print("The LED is still NONE! Unable to operate... Ack-ing anyway!")
            message.ack()
    except Exception as e:
        print("Errore: {}".format(e))

def publish_led_status(project, topic_name, device_id):
    current_ts = int(round(time.time() * 1000))

    red_led_status = None
    if red_led != None:
        if red_led.is_lit:
            red_led_status = "on"
        else:
            red_led_status = "off"
    else:
        red_led_status = "unavailable"
    red_led_json = '{{ "device_id":"{}","led_color":"{}","light_type":"{}","gpio_pin":"{}","status":"{}" }}'.format(
                        device_id, "red", "led", "17", red_led_status)

    green_led_status = None
    if green_led != None:
        if green_led.is_lit:
            green_led_status = "on"
        else:
            green_led_status = "off"
    else:
        green_led_status = "unavailable"
    green_led_json = '{{ "device_id":"{}","led_color":"{}","light_type":"{}","gpio_pin":"{}","status":"{}" }}'.format(
                        device_id, "red", "led", "18", green_led_status)

    status_message = '{{ "devices": [{}, {}], "ts":"{}" }}'.format(red_led_json, green_led_json, current_ts)

    print("Publishing message: {}".format(status_message))
    publish_message(project, topic_name, status_message)

def run_logic(args):
    global green_led
    global red_led
    global light_bulb
    global button
    global my_green_led_pin
    global my_red_led_pin

    my_green_led_pin = args.green_led_pin
    my_red_led_pin = args.red_led_pin

    print("EMULATE='{}'".format(EMULATE))
    if EMULATE != True:
        print("Production MODE: seting up LEDs ...")
        green_led = LED(args.green_led_pin)
        red_led = LED(args.red_led_pin)
        light_bulb = LED(args.light_bulb_pin)
        light_bulb.on()
        button = Button(args.push_button_pin)
    else:
        print("Emulation MODE: LEDs will be 'None'")

    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = None
    subscription_name = None

    subscription_created = False
    if args.commands_subscription_name == None or args.commands_subscription_name == "":
        subscription_name="{}_subscr_01".format(args.commands_topic_name)
        print("Creating new subscription with name '{}' on topic '{}'".format(subscription_name, args.commands_topic_name))
        subscription_path = create_subscription(
            args.project,
            args.commands_topic_name,
            subscription_name,
            subscriber)
        subscription_created = True
        print("Subscription path is '{}'".format(subscription_path))
    else:
        subscription_name = args.commands_subscription_name
        print("Binding subscription '{}'".format(subscription_name))
        subscription_path = subscriber.subscription_path(
            args.project,
            subscription_name)
        print("Subscription path is '{}'".format(subscription_path))

    print("================================================")
    print(" Creating PUB/SUB subsription for 'COMANDS' ...")
    print("------------------------------------------------")
    print("         PROJECT: {}".format(args.project))
    print("           TOPIC: {}".format(args.commands_topic_name))
    print("    SUBSCRIPTION: {}".format(subscription_name))
    print("    FLOW CONTROL: {}".format(args.max_batch_size))
    print("================================================")

    #flow_control = pubsub_v1.types.FlowControl(max_messages=args.max_batch_size)
    subscriber.subscribe(
        subscription_path,
        callback=on_pubsub_message)

    print("Going Live ...")

    try:
        while True:
            print("Generating status update message")
            publish_led_status(args.project, args.status_topic_name, args.device_id)
            print("Sleeping now, {} s".format(args.frequency))
            time.sleep(args.frequency)
    except KeyboardInterrupt:
        if subscription_created:
            print("================================================")
            print(" Stopping deamon ...")
            print("------------------------------------------------")
            print("  REMOVING SUBSCRIPTION: '{}'...".format(subscription_name))
            delete_subscription(args.project, subscription_name, subscriber)
            print("================================================")


# GLOBALS
reference_device_id = None
message_max_ttl = None
EMULATE = None

my_green_led_pin = None
my_red_led_pin = None

green_led = None
red_led = None
light_bulb = None
button = None


if __name__ == '__main__':
    #global EMULATE
    #global reference_device_id
    #global message_max_ttl
    #global my_green_led_pin
    #global my_red_led_pin
    #global green_led
    #global red_led
    #global light_bulb
    #global button

    EMULATE = False
    reference_device_id = None
    message_max_ttl = 0

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
            '--project',
            default=os.environ.get('GOOGLE_CLOUD_PROJECT'),
            help='GCP cloud project name')
    parser.add_argument(
            '--device_id',
            required=True,
            help='The device UUID used to publish status messages and to match commands')
    parser.add_argument(
            '--frequency',
            type=int,
            default=30,
            help='Frequency for the device to publish status message')
    parser.add_argument(
            '--commands_topic_name',
            required=True,
            help='PUB/SUB TOPIC for COMMANDS')
    parser.add_argument(
            '--commands_subscription_name',
            help='PUB/SUB SUBCRIPTION for COMMANDS')
    parser.add_argument(
            '--status_topic_name',
            required=True,
            help='PUB/SUB TOPIC for STATUS')
    parser.add_argument(
            '--emulate_gpio',
            type=bool,
            default=False,
            help='To Emulate GPIO when testing outside PI')
    parser.add_argument(
            '--message_max_ttl',
            type=int,
            default=60000,
            help='Maximum time-to-live for a command message to be considered as not expired')
    parser.add_argument(
            '--green_led_pin',
            type=int,
            default=18,
            help='GPIO PIN for GREEN LED')
    parser.add_argument(
            '--red_led_pin',
            type=int,
            default=17,
            help='GPIO PIN for RED LED')
    parser.add_argument(
            '--light_bulb_pin',
            type=int,
            default=21,
            help='GPIO PIN for LIGHT BULB')
    parser.add_argument(
            '--push_button_pin',
            type=int,
            default=23,
            help='GPIO PIN for PUSH BUTTON')
    parser.add_argument(
            '--max_batch_size',
            type=int,
            default=3,
            help='Number of messagges pulled from PUB/SUB (max)')
    args = parser.parse_args()

    print("EMULATION FLAG: {}".format(args.emulate_gpio))
    EMULATE=args.emulate_gpio

    print("DEVICE ID: {}".format(args.device_id))
    reference_device_id = args.device_id

    message_max_ttl = args.message_max_ttl

    run_logic(args)
