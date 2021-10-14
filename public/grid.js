var info = [];
var tCategory = [];
var totalSigners = [];
var totalTypes = [];
var currentIndex = 1;
var From;
var To;
var requestHelp = [];

var filterParams = {
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    if (cellValue == null) return -1;

    if (
      filterLocalDateAtMidnight.getDate() === cellValue.getDate() &&
      filterLocalDateAtMidnight.getMonth() === cellValue.getMonth() &&
      filterLocalDateAtMidnight.getFullYear() === cellValue.getFullYear()
    )
      return 0;
    else if (cellValue < filterLocalDateAtMidnight) return -1;
    else cellValue > filterLocalDateAtMidnight;
    return 1;
  },
  browserDatePicker: true,
  minValidYear: 2000,
};

var columnDefs = [
  {
    field: "rowId",
    cellRenderer: "loadingRenderer",
    sortable: false,
    width: 80,
  },
  { field: "organizationId", sortable: true, filter: true, width: 150 },
  { field: "ada", sortable: true, filter: true, width: 140 },
  {
    field: "issueDate",
    sortable: true,
    filter: "agDateColumnFilter",
    filterParams: filterParams,
    width: 159,
  },
  { field: "protocolNumber", sortable: true, filter: true, width: 160 },
  {
    field: "subject",
    sortable: true,
    filter: true,
    width: 100,
    resizable: true,
  },
  {
    field: "thematicCategory",
    sortable: true,
    filter: true,
    resizable: true,
    width: 230,
  },
  { field: "decisionType", sortable: true, filter: true, resizable: true },
  {
    field: "signer",
    sortable: true,
    filter: true,
    width: 180,
    resizable: true,
  },
  {
    field: "submissionTimestamp",
    sortable: true,
    filter: "agDateColumnFilter",
    filterParams: filterParams,
  },
];

var rowData = [];
var gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  rowSelection: "single",
  onRowDoubleClicked: openTab,
  pagination: true,
  paginationPageSize: 500,
  onPaginationChanged: onPaginationChanged,
  components: {
    loadingRenderer: function (params) {
      if (params.value !== undefined) {
        return params.value;
      } else {
        return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
      }
    },
  },
};

function openInNewTab(url) {
  var win = window.open(url, "_blank");
  win.focus();
}

var eGridDiv = document.querySelector("#myGrid");
new agGrid.Grid(eGridDiv, gridOptions);

function onPaginationChanged() {
  pageRequest(info, gridOptions.api.paginationGetCurrentPage());
}

function getNullIndex(data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i] == null) return i;
  }
}

function openTab() {
  var selectedRows = gridOptions.api.getSelectedRows();
  openInNewTab(`https://diavgeia.gov.gr/decision/view/${selectedRows[0].ada}`);
}

function convertDate(jsonDate) {
  var currentTime = new Date(jsonDate);
  var day = currentTime.getDate();
  var month = currentTime.getMonth();
  var year = currentTime.getFullYear();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  newDate = new Date(year, month, day, hours, minutes, seconds);

  return newDate;
}

const addInfo = (ev) => {
  info = [];
  tCategory = [];
  totalSigners = [];
  totalTypes = [];
  rowData = [];
  gridOptions.api.setRowData(rowData);
  currentIndex = 1;
  From = null;
  To = null;

  gridOptions.api.paginationGoToFirstPage();
  ev.preventDefault();
  info.push(document.getElementById("fid").value);
  info.push(document.getElementById("start").value);
  info.push(document.getElementById("end").value);

  f(info);
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submit").addEventListener("click", addInfo);
});

function getTypes(object, dType) {
  for (let i = 0; i < object.decisionTypes.length; i++) {
    if (object.decisionTypes[i].uid == dType)
      return object.decisionTypes[i].label;
  }
}

async function f(info) {
  //name request

  info[3] = `https://diavgeia.gov.gr/luminapi/opendata/organizations/${info[0]}/signers?status=all`;
  let new_options = {
    method: "GET", 
    headers: {
      "Content-Type": "application/json",
    },
   // body: JSON.stringify(info),
    
  };
  
  let res = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
  var signers = await res.json();
  totalSigners = signers.objects;

  //type request

  info[3] = `https://diavgeia.gov.gr/luminapi/opendata/types.json`;
  new_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(info),
  };
  res = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
  var types = await res.json();
  totalTypes = types;

  //thk request
  info[3] = `https://diavgeia.gov.gr/luminapi/opendata/dictionaries/THK.json`;
  new_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(info),
  };
  res = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
  var thk = await res.json();

  tCategory = thk.objects;
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //vriskw size tou grid
  var from = new Date(info[1]);
  var to = new Date(info[2]);
  var temp = new Date(info[2]);

  temp.setDate(temp.getDate() - 180);
  reqDate = temp.getFullYear() + "-" + temp.getMonth() + "-" + temp.getDate();

  var base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&to_issue_date=${info[2]}&size=500`;

  var flag = false;
  var totalSize = 0;
  if (temp > from) {
    //Mono an to diastima einai megalutero twn 6mhnwn gia na vroume posa 6mhna einai
    var reqDate;
    var base_urls = [];
    flag = true;
    var lastDate;
    while (to >= from) {
      lastDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());
      to.setDate(to.getDate() - 180);

      if (to >= from) {
        reqDate = to.getFullYear() + "-" + to.getMonth() + "-" + to.getDate();
        base_urls.push(
          `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_issue_date=${reqDate}`
        );
      } else {
        reqDate =
          from.getFullYear() + "-" + from.getMonth() + "-" + from.getDate();
        last =
          lastDate.getFullYear() +
          "-" +
          lastDate.getMonth() +
          "-" +
          lastDate.getDate();
        base_urls.push(
          `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_issue_date=${reqDate}&to_issue_date=${last}`
        );
      }
    }
    var arraySizes = await getTotalSize(base_urls);

    for (let i = 0; i < arraySizes.length; i++) totalSize += arraySizes[i];
  } else
    base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_issue_date=${info[1]}&to_issue_date=${info[2]}&size=500`;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //prwto request

  var gridData;
  let tmp_url = base_url;
  info[3] = tmp_url;

  new_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(info),
  };
  let response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
  let new_data = await response.json();

  gridData = createGridPage(new_data, signers.objects, types, thk.objects, 0);

  if (flag) rowData.length = totalSize;
  else rowData.length = new_data.objects.info.total;

  for (let i = 0; i < rowData.length; i++)
    rowData[i] = {
      ada: null,
      issueDate: null,
      protocolNumber: null,
      subject: null,
      thematicCategory: null,
      decisionType: null,
      signer: null,
      submissionTimestamp: null,
      organizationId: null,
      id: i,
    };

  for (let i = 0; i < gridData.length; i++) rowData[i] = gridData[i];
  ////////////////////////////////////////////////
  if(rowData.length>500){
    tmp_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_issue_date=${info[1]}&size=500`;

    info[3] = tmp_url;
  
    new_options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      //body: JSON.stringify(info),
    };
    response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
    new_data = await response.json();
  
    let lastPage = Math.ceil(new_data.objects.info.total / 500);
  
    tmp_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${
      info[0]
    }&from_issue_date=${info[1]}&page=${lastPage - 1}&size=500`;
    info[3] = tmp_url;
  
    new_options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      //body: JSON.stringify(info),
    };
    response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
    new_data = await response.json();
  
    /////////////////////////////////////////////////////
    gridData = createGridPage(
      new_data,
      signers.objects,
      types,
      thk.objects,
      Math.ceil(rowData.length / 500) - 1
    );
    if (new_data.objects.info.actualSize < 500) {
      base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${
        info[0]
      }&from_issue_date=${info[1]}&page=${lastPage - 2}&size=500`;
  
      info[3] = base_url;
  
      new_options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(info),
      };
      response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
      new_data = await response.json();
  
      let dataYetToFill = 500 - gridData.length;
  
      let tempGrid = [];
      let j = 0;
      while (dataYetToFill - 1 >= 0) {
        tempGrid[j] = new_data.objects.decisions[499 - dataYetToFill];
        dataYetToFill--;
        j++;
      }
  
      new_data.objects.decisions = tempGrid;
      new_data.objects.info.actualSize = tempGrid.length;
      let tgridData = createGridPage(
        new_data,
        totalSigners,
        totalTypes,
        tCategory,
        Math.ceil(rowData.length / 500) - 1
      );
      for (let i = 0; i < gridData.length; i++) tgridData.push(gridData[i]);
      gridData = tgridData;
    }
  
    let j = gridData.length - 1;
  
    for (
      let i = rowData.length - 1;
      i >=
      rowData.length - (rowData.length - Math.floor(rowData.length / 500) * 500);
      i--
    ) {
      rowData[i] = gridData[j];
      j--;
      rowData[i].rowId = i + 1;
    }   
  }


  this.gridOptions.api.setRowData(rowData);
}

async function pageRequest(info, page) {
  var index = page * 500;
  var rowNode = gridOptions.api.getRowNode(index);
  if (rowData[index] && rowData[index].ada === null) {
    var leftOrRight = index - 1;
    if (rowData[index + 500] && rowData[index + 500].ada !== null)
      leftOrRight = index + 500;
    var currentDate = rowData[leftOrRight].submissionTimestamp;
    toDate =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate();

    var gridData;
    var base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&to_date=${toDate}&to_issue_date=${toDate}&size=500`;
    if (leftOrRight == index + 500)//in case left button was clicked
      base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${info[0]}&from_issue_date=${toDate}&size=500`;
    info[3] = base_url;

    new_options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      //body: JSON.stringify(info),
    };
    let response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
    let new_data = await response.json();
    gridData = createGridPage(
      new_data,
      totalSigners,
      totalTypes,
      tCategory,
      page
    );

    if (leftOrRight == index + 500) {//left button was clicked
      let lastPage = Math.ceil(new_data.objects.info.total / 500);
      base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${
        info[0]
      }&from_issue_date=${toDate}&page=${lastPage - 1}&size=500`;

      info[3] = base_url;

      new_options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(info),
      };
      response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
      new_data = await response.json();
     
      gridData = createGridPage(
        new_data,
        totalSigners,
        totalTypes,
        tCategory,
        page
      );
      gridData=checkAndRemoveDoubleDates(gridData,currentDate);
      if (new_data.objects.info.actualSize < 500) {
        base_url = `https://diavgeia.gov.gr/luminapi/opendata/search?org=${
          info[0]
        }&from_issue_date=${toDate}&page=${lastPage - 2}&size=500`;

        info[3] = base_url;

        new_options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          //body: JSON.stringify(info),
        };
        response = await fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, new_options);
        new_data = await response.json();

        let dataYetToFill = 500 - gridData.length;

        let tempGrid = [];
        let j = 0;
        while (dataYetToFill - 1 >= 0) {
          tempGrid[j] = new_data.objects.decisions[499 - dataYetToFill];
          dataYetToFill--;
          j++;
        }

        new_data.objects.decisions = tempGrid;
        new_data.objects.info.actualSize = tempGrid.length;
        let tgridData = createGridPage(
          new_data,
          totalSigners,
          totalTypes,
          tCategory,
          page
        );
        for (let i = 0; i < gridData.length; i++) tgridData.push(gridData[i]);
        gridData = tgridData;
      }
    }
    //  else{
    for (let j = 0; j < gridData.length; j++) {
      rowNode = gridOptions.api.getRowNode(page * 500 + j);
      if (rowNode !== undefined) {
        rowNode.setData({
          ada: gridData[j].ada,
          issueDate: gridData[j].issueDate,
          protocolNumber: gridData[j].protocolNumber,
          subject: gridData[j].subject,
          thematicCategory: gridData[j].thematicCategory,
          decisionType: gridData[j].decisionType,
          signer: gridData[j].signer,
          submissionTimestamp: gridData[j].submissionTimestamp,
          organizationId: gridData[j].organizationId,
          rowId: page * 500 + j + 1,
          id: rowNode.id,
        });
        rowData[page * 500 + j] = gridData[j];
      }
    }
    // }
  }
}

function getSignerName(signers, signer_id) {
  for (let i = 0; i < signers.signers.length; i++) {
    if (signers.signers[i].uid === signer_id[0]) {
      return signers.signers[i].lastName + " " + signers.signers[i].firstName;
    }
  }
}

function getThk(thk, uid) {
  for (let i = 0; i < thk.items.length; i++)
    if (thk.items[i].uid == uid) return thk.items[i].label;
}

function createGridPage(data, signers, types, thk, page) {
  var rowData = [];

  for (let i = 0; i < data.objects.info.actualSize; i++) {
    rowData.push({
      ada: data.objects.decisions[i].ada,
      issueDate: convertDate(data.objects.decisions[i].issueDate),
      protocolNumber: data.objects.decisions[i].protocolNumber,
      subject: data.objects.decisions[i].subject,
      thematicCategory: getThk(
        thk,
        data.objects.decisions[i].thematicCategoryIds[0]
      ),
      decisionType: `${getTypes(
        types.objects,
        data.objects.decisions[i].decisionTypeId
      )}`,
      signer: getSignerName(signers, data.objects.decisions[i].signerIds),
      submissionTimestamp: convertDate(
        data.objects.decisions[i].submissionTimestamp
      ),
      organizationId: data.objects.decisions[i].organizationId,
      rowId: page * 500 + i + 1,
    });
  }
  return rowData;
}

async function getTotalSize(urls) {
  try {
    var data = await Promise.all(
      urls.map((url) => {
        info[3] = url;
        return fetch(`http://192.168.1.8:5500/api?URL=${info[3]}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          //body: JSON.stringify(info),
        })
          .then((x) => {
            return x.json();
          })
          .then((x) => {
            return x;
          });
      })
    );
    var total = [];

    for (let i = 0; i < data.length; i++) total[i] = data[i].objects.info.total;
    return total;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

function checkAndRemoveDoubleDates(gridData,currentDate){

  
  temp=[];
  for(let i=0;i<gridData.length;i++){
    if(gridData[i].submissionTimestamp<=currentDate){
      
      return temp;
    }
     
    else
      temp[i]=gridData[i];
  }
  return temp;
}