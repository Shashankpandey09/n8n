
export const credentialSchema=[{
    platform:'smtp',
    RequiredKeys:[
      {
        name:'EMAIL_USER',
        type:'text',
        placeholder:'@gmail.com',
        required:true
      },
      {
      name:'EMAIL_PASS',
      type:'password',
      placeholder:'******',
      required:true
      }
    ]
}]