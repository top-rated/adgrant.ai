import { linkedInAgnet } from './src/agnet/adGrantAgnet.js'


const main=async(threadId,query)=>{
  const result=await linkedInAgnet(threadId,query);
  console.log(result);
}

const threadId='123';
const query='hello how are you';

main(threadId,query);
