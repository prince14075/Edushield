const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Edushield?appName=Edushield";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('Edushield');
    const institutes = database.collection('institutes');
    const results = await institutes.find({}).toArray();
    
    console.log("Found Institutes:", results.length);
    results.forEach(inst => {
      console.log(`- ID: ${inst.instituteId}, Name: ${inst.name}`);
    });
  } finally {
    await client.close();
  }
}

main().catch(console.error);
