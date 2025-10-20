<!-- implement The send email node for now  -->
<!-- add LRU CACHE (least recently used cache in executor for transporters in order to maintain a min amount of transporter) -->
<!-- 1.start implementing for gmail trigger (first learn from gemini and implement it)

-for gmail trigger here's what im gonna do create a entry in the db and keep listening -to the gmail if there is a reply with the same token or messageId then im gonna push
-the events to the kafka which will trigger the workflow again  -->
<!-- create user routes -->
<!-- protect all the routes -->
<!-- delete user credential routes -->
<!-- update workflow route  -->
<!-- delete workflow route  -->
<!-- create workflow route cleaning up most of the codes there defined are for put workflow route -->
need to create a credential page 
once credential is saved don't display the credentials in the node setting ( store in the global_store )
once a node is clicked check wether the cred for it exist in the store or not if not then display the cred in the node setting 
when saving a workflow then load the credentials from the store and add it to the the node 
also one problem here left is that we are not loading the workflow from backend (we need to make the get route) 
when loading the workflow then convert back to normal nodes and store in the localstorage if not available then from the backend

