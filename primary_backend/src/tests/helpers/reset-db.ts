import prisma from "@shashankpandey/prisma";
export async function resetDb(){
   await prisma.$transaction(async(ctx)=>{
    await ctx.user.deleteMany({});
    await ctx.emailWait.deleteMany({})
   }) 
}