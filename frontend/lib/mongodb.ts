import { MongoClient, MongoClientOptions } from 'mongodb';

// MongoDB Atlas 연결 문자열
const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:1234@cluster0.cmjwir7.mongodb.net/ESG?retryWrites=true&w=majority&appName=Cluster0';

if (!uri) {
  throw new Error('MONGODB_URI가 설정되지 않았습니다.');
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  authSource: 'admin'
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise; 