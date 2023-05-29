import Client, { connect } from '@dagger.io/dagger'

connect(
    async (client: Client) => {
        const node = client.container().from("node:18").withExec(["node", "-v"])

        const version = await node.stdout()

        console.log("Hello from Dagger and Node " + version)
    },
    { LogOutput: process.stderr }
)