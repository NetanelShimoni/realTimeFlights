const {log} = require("util");

const axios = require('axios').default;

axios.get("https://airlabs.co/api/v9/schedules?arr_iata=TLV&api_key=ab70d4c3-f7a7-448b-9397-bb86c54656e0").
then(data=> console.log(data.data))
//arr_time is current necita