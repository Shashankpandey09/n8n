import { Init } from "./services/Executor";
import { InitImap } from "./services/ImapPerUserListeners";

async function main() {
    try {
       await Init()
       await InitImap() 
    } catch (error) {
       console.log(error)
       console.log('shutting the process down')
       process.exit(1) 
    }
}
main()