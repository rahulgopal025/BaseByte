import NodeCache from "node-cache";

// StdTTL: Standard Time To Live in seconds. 
// 3600 seconds = 1 hour cache duration by default.
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export default cache;
