const CosmosClient = require("@azure/cosmos").CosmosClient;
const endpoint = process.env.cosmosdbEndpoint;
const key = process.env.cosmosdbAuthKey;

const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);
    if (req.query.PersonID) {
        const database = client.database("Service");
        const container = database.container("personas");

        try {
            // Use the `.items.query` method to retrieve all items with the given PersonID
            const { resources: items } = await container.items
                .query(`SELECT * FROM c WHERE c.PersonID = '${req.query.PersonID}'`)
                .fetchAll();

            context.log(items.length);

            if (items.length === 0) {
                context.res = {
                    status: 404,
                    body: "No entries found for PersonID " + req.query.PersonID
                };
            } else {
                context.res = {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(items)
                };
            }
        } catch (err) {
            context.log.error(err.message);
            context.res = {
                status: 500,
                body: "Something went wrong.."
            };
        }
    } else {
        context.res = {
            status: 400,
            body: "Please provide a PersonID as query parameter"
        };
    }
}
