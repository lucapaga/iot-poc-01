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


def publish_message(project, topic_name, message, client):
#    publisher = pubsub_v1.PublisherClient()
    publisher = client
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

        print(" - LED COLOR: {}".format(aCommand["led_color"]))
        print(" -    ACTION: {}".format(aCommand["action"]))

        theLED = None
        if aCommand["led_color"].lower() == "green":
            theLED = green_led
            print("Working on GREEN led")
        elif aCommand["led_color"].lower() == "red":
            theLED = red_led
            print("Working on RED led")
        elif aCommand["led_color"].lower() == "light-bulb":
            theLED = light_bulb
            print("Working on LIGHT BULB")
        else:
            print("Unkown LED color: {}".format(aCommand["led_color"]))

        if theLED != None:
            if aCommand["action"] == "light-on":
                print("Switching the LED on")
                if EMULATE != True:
                    if aCommand["led_color"].lower() == "light-bulb":
                        theLED.off()
                    else:
                        theLED.on()
            elif aCommand["action"] == "light-off":
                print("Switching the LED off")
                if EMULATE != True:
                    if aCommand["led_color"].lower() == "light-bulb":
                        theLED.on()
                    else:
                        theLED.off()
            else:
                print("Unkown ACTION: {}".format(aCommand["action"]))
	else:
	    print("The LED is still NONE! Unable to operate... Ack-ing anyway!")

        message.ack()
    except Exception as e:
        print("Errore: {}".format(e))

def run_logic(args):
    global green_led
    global red_led
    global light_bulb
    global button

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

    flow_control = pubsub_v1.types.FlowControl(max_messages=args.max_batch_size)
    subscriber.subscribe(
        subscription_path,
        callback=on_pubsub_message,
        flow_control=flow_control)

    print("Going Live ...")

    try:
        while True:
            print("Sleeping now")
            time.sleep(10)
    except KeyboardInterrupt:
        if subscription_created:
            print("================================================")
            print(" Stopping deamon ...")
            print("------------------------------------------------")
            print("  REMOVING SUBSCRIPTION: '{}'...".format(subscription_name))
            delete_subscription(args.project, subscription_name, subscriber)
            print("================================================")


green_led = None
red_led = None
light_bulb = None
button = None

EMULATE = False


if __name__ == '__main__':
    global EMULATE

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
            '--project',
            default=os.environ.get('GOOGLE_CLOUD_PROJECT'),
            help='GCP cloud project name')
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

    run_logic(args)
