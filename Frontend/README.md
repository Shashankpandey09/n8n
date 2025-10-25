need to create a credential page 
once credential is saved don't display the credentials in the node setting ( store in the global_store )
once a node is clicked check wether the cred for it exist in the store or not if not then display the cred in the node setting 
when saving a workflow then load the credentials from the store and add it to the the node 
also one problem here left is that we are not loading the workflow from backend (we need to make the get route) 
when loading the workflow then convert back to normal nodes and store in the localstorage if not available then from the backend