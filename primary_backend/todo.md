<!-- create a webhook with path and if user provides secret then dump it in the db else authentication is none  -->
create a credentials for gmail and telegram 
the webhook route creates an execution in the db using transactional pattern 
write the execution logic 
if the webhook send a body data along with it like who to send gmail and body or subject store it in the execution table and also populate it in the execution task table 
create a sweeper whose work is just to pull the data from the db and push it to the kafka and after that delete the pulled out outbox id
create a worker which pull out the execution id and workflow id from kafka and based on the type of execution execute the logic create an entry in the execution task table and send the next node for execution to the kafka queue 
outbox table may need payload which may be used by the other nodes 