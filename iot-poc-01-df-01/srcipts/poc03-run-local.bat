cd ..
set GOOGLE_APPLICATION_CREDENTIALS=srcipts\sa\pi-pocs-dataflow-sa01-0f8028c69517.json
mvn compile exec:java -Dexec.mainClass=it.lucapaga.pocs.iot.dataflow.poc03.flow.DeviceUpdatesStreamingPipeline -Dexec.args="--project=luca-paganelli-formazione --sourceTopicName=projects/luca-paganelli-formazione/topics/gpio_status_topic" -Pdirect-runner
cd srcipts