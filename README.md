Requirements

```
  Docker Node >= 18+

  Witness https://docs.witness.co/
``` 


Sample docker-compose & .env are attached.

After cloning, run `npm install`

Create Proof

`tsnode codeWitness.ts deploy-create-proof /path/to/dcker-compose.yml /path/to/.env file`

Outputs Hash for 

    docker-compose file

    .env file

The hash is created from the contents of these files.


Verify

`tsnode codeWitness.ts verify-deploy docker-compose-file-hash env-file-hash`
