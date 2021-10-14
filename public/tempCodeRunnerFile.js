
//thk request
info[3]=`https://diavgeia.gov.gr/luminapi/opendata/dictionaries/THK.json`;
new_options={
    method:'POST',
    headers:{
        'Content-Type':'application/json',
    },
    body:JSON.stringify(info),
};
res = await fetch('/api',new_options);
var thk = await res.json(); 

var gridData;
var base_url=`https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_date=${info[1]}&to_date=${info[2]}&size=500&page=`;