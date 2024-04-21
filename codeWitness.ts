import { exec } from 'child_process';
import { WitnessClient } from '@witnessco/client'
import fs from 'node:fs';
const witness = new WitnessClient()

const WitnessCode = async (composeData: string, envData: string) => {

    // Instantiate a new client, default params should suffice for now.
       
    
        // Unique string, so we get an unseen leafHash.
        const sampleString = `Check the chain! @ ${Date.now()}`
        const composeHash = witness.hash(composeData)
        const envHash = witness.hash(envData)
    

        console.log(`Posting composeHash ${composeHash}`)
        console.log(typeof(composeHash))
        await witness.postLeaf(composeHash)
        console.log('Waiting for onchain inclusion (may take up to 10min)')
        await witness.waitForCheckpointedLeafHash(composeHash)
    
        // Get the timestamp for the leaf.
        const composetimestamp = await witness.getTimestampForLeafHash(composeHash)
        console.log(`Leaf ${composeHash} was timestamped at ${composetimestamp}`)
    
        console.log(`Posting envHash ${envHash}`)
        await witness.postLeaf(envHash)
        console.log('Waiting for onchain inclusion (may take up to 10min)')
        await witness.waitForCheckpointedLeafHash(envHash)
    
        // Get the timestamp for the leaf.
        const envtimestamp = await witness.getTimestampForLeafHash(envHash)
        console.log(`Leaf ${envHash} was timestamped at ${envtimestamp}`)


        return { 'docker-file': composeHash, 'env-file': envHash }
    };

const VerifyCodeHash = async(composeFileHash: string, envHash: string) => {
    const c0x = composeFileHash as `0x${string}`
    // Get and verify proof.
    const composeFileProof =    await witness.getProofForLeafHash(c0x)
    const composeFileVerified = await witness.verifyProofChain(composeFileProof)
    console.log(`composeFile Proof verified: ${composeFileVerified}`)

    const e0x = envHash as `0x${string}`
    const envFileProof =    await witness.getProofForLeafHash(e0x)
    const envFileVerified = await witness.verifyProofChain(envFileProof)
    console.log(`envFile Proof verified: ${envFileVerified}`)
}
// Function to deploy the Todo application using Docker Compose
const deployApp = (composefile: string, envfile: string) => {
    // Command to execute Docker Compose with the environment file
    const command = 'docker-compose -f ' + composefile +' --env-file ' + envfile + ' up -d';
    
    console.log(command)
    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Docker Compose: ${error}`);
        return;
      }else{
        try {
          const composeData = fs.readFileSync(composefile, 'utf8');
          console.log(composeData);

          const envData = fs.readFileSync(envfile, 'utf8');
          console.log(envData);

          const fileHash = WitnessCode(composeData, envData)

        } catch (err) {
          console.error(err);
        }
      }
  
      console.log(`Docker Compose output: ${stdout}`);
      if (stderr) {
        console.error(`Docker Compose error: ${stderr}`);
      }
    });
  };
  


// Call the function to deploy the Todo application

// Access command-line arguments
const args = process.argv.slice(2); // The first two elements of process.argv are the Node.js executable path and the script file path

// Check if command-line arguments were provided
if (args.length === 0) {
  console.log('No operation mentioned. Options\n\n1.deploy-create-proof\n2.verify-deploy');
} else {
  
  console.log('Requested Opteration:' + args[0]);

  if(args[0] == 'deploy-create-proof'){
    console.log('Path of docker-compose file: '+ args[1])
    console.log('Path of docker-compose env file: '+ args[2])

    deployApp(args[1], args[2])
    
  }else if(args[0] == 'verify-deploy'){
    console.log('Compose Data hash: '+ args[1])
    console.log('Environment File Hash: '+ args[2])

    VerifyCodeHash(args[1], args[2])
    
  }else{
    console.log('Unsupported:');
  }
}