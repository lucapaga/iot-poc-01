set GOOGLE_APPLICATION_CREDENTIALS=srcipts\sa\pi-pocs-dataflow-sa01-0f8028c69517.json

mvn compile exec:java -Dexec.mainClass=it.lucapaga.pocs.iot.dataflow.poc02.DeviceStatusStreamedUpdate -Dexec.args="--project=luca-paganelli-formazione" -Pdirect-runner

mvn compile exec:java -Dexec.mainClass=it.lucapaga.pocs.iot.dataflow.poc02.DeviceStatusStreamedUpdate -Dexec.args="--project=luca-paganelli-formazione --pubsubSubscription=projects/luca-paganelli-formazione/subscriptions/gpio_status_cli" -Pdirect-runner

mvn compile exec:java -Dexec.mainClass=it.lucapaga.pocs.iot.dataflow.poc02.DeviceStatusStreamedUpdate -Dexec.args="--project=luca-paganelli-formazione --pubsubTopic=projects/luca-paganelli-formazione/topics/gpio_status_topic" -Pdirect-runner


mvn compile exec:java -Dexec.mainClass=it.lucapaga.pocs.iot.dataflow.poc02.DeviceStatusStreamedUpdate -Dexec.args="--runner=DataflowRunner --project=luca-paganelli-formazione --gcpTempLocation=gs://dataflow-luca-paganelli-formazione-02/df --pubsubTopic=projects/luca-paganelli-formazione/topics/gpio_status_topic" -Pdataflow-runner
