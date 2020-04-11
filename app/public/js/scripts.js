$(document).ready(function() {
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});

function showModal(t, m, callback) {
  $('.modal-'+t+' .modal-body p').html(m);
  $('.modal-'+t).modal('show');
  if ($.isFunction(callback)) {
    /*
    $('.modal-'+t).on('hidden', function () {
      callback();
    })
    */
    $('#force').click(function () {
      callback();
    })
  }
}
function is_numeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
if (document.getElementById('files')) {
  var res = [];
  var files;

  
  var progress = document.querySelector('.percent');
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);

}

function setType(data) {
  console.log("data");
  console.log(data);
  $.ajax({
    method: "POST",
    url: "/admin-flyer/accounting/set-type/"+data.req.col+"/",
    data: data
  })
  .done(data => {
    console.log("data");
    console.log(data);
  })
  .fail(function (jqXHR, textStatus) {
    console.log("jqXHR");
    console.log(jqXHR);
    console.log("textStatus");
    $("#alert")
    .html("<h4>There are some errors</h4><ul><li>"+jqXHR.responseText+"</li></ul>")
    .removeClass("hidden")
    .addClass("alert-danger");
    $('html,body').animate({scrollTop: $("body").offset().top},'slow');
    console.log(textStatus);
  });
}

function save(r) {
  $.ajax({
    method: "POST",
    url: "/admin-flyer/accounting/import/purchases/",
    data: {"imports": r}
  })
  .done(data => {
    console.log("data");
    console.log(data);
  })
  .fail(function (jqXHR, textStatus) {
    console.log("jqXHR");
    console.log(jqXHR);
    console.log("textStatus");
    $("#alert")
    .html("<h4>There are some errors</h4><ul><li>"+jqXHR.responseText+"</li></ul>")
    .removeClass("hidden")
    .addClass("alert-danger");
    $('html,body').animate({scrollTop: $("body").offset().top},'slow');
    console.log(textStatus);
  });
}

function handleFileSelect(evt) {
	// Reset progress indicator on new file selection.
	progress.style.width = '0%';
	progress.textContent = '0%';
	evt.stopPropagation();
	evt.preventDefault();
	files = evt.target.files ? evt.target.files : evt.dataTransfer.files;
	//var files = evt.dataTransfer.files; // FileList object.
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
    var reader = new FileReader();
    function abortRead() {
      reader.abort();
    }
    reader.onerror = (evt) => {
        if(evt) {
        switch(evt.target.error.code) {
          case evt.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
          case evt.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
          case evt.target.error.ABORT_ERR:
            break; // noop
          default:
            alert('An error occurred reading this file.');
        };
      };
    }
    
    reader.onprogress = (evt) => {
      // evt is an ProgressEvent.
      if (evt && evt.lengthComputable) {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
          progress.style.width = percentLoaded + '%';
          progress.textContent = percentLoaded + '%';
        }
      }
    }
    /* reader.onabort = function(e) {
      alert('File read cancelled');
    }; */
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      console.log("reader.onload");
      console.log(e);
      res.push({result: e.target.result, total: e.total});
      if (res.length == files.length) {
        for (var a = 0; a<res.length; a++) {
          res[a].filename = escape(files[a].name);
          var row = "";
          row+= "<tr>";
          row+= "	<td>";
          row+= "	<button data-id=\""+$(res[a].result).find("FatturaElettronicaBody DatiGenerali DatiGeneraliDocumento Numero").html()+"\" type=\"button\" class=\"btn btn-danger\">";
          row+= "	DELETE";
          row+= "	</span>";
          row+= "	</button>";
          row+= "	</td>";
          row+= "	<td>"+$(res[a].result).find("FatturaElettronicaBody DatiGenerali DatiGeneraliDocumento Data").html()+"</td>";
          row+= "	<td>"+$(res[a].result).find("FatturaElettronicaBody DatiGenerali DatiGeneraliDocumento Numero").html()+"</td>";
          row+= "	<td>"+$(res[a].result).find("CedentePrestatore DatiAnagrafici Anagrafica Denominazione").html()+"</td>";
          row+= "	<td>"+$(res[a].result).find("FatturaElettronicaBody DatiGenerali DatiGeneraliDocumento ImportoTotaleDocumento").html()+"</td>";
          row+= "	<td>"+escape(files[a].name)+"</td>";
          row+= "	<td>"+files[a].size+"</td>";
          row+= "	<td>"+res[a].total+"</td>";
          row+= "</tr>";
          $("#tbody").append(row);
        }
        $(".dropresults").removeClass("hidden");
        $("#imports").val(JSON.stringify(res));
        progress.style.width = '100%';
        progress.textContent = '100%';
        setTimeout("document.getElementById('progress_bar').className='';", 2000);          
      }
      // Ensure that the progress bar displays 100% at the end.
    }
  
		output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
								f.size, ' bytes, last modified: ',
								f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
								'</li>');
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
		// Read in the image file as a binary string.
		reader.readAsText(files[i]);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
/* DA RIVEDERE */
//Form to JSON Object
/*
$.fn.serializeObject = function()
{
    var objectedForm = {};
    var serializedForm = this.serializeArray();
    $.each(serializedForm, function() {
        if (objectedForm[this.name] !== undefined) {
            if (!objectedForm[this.name].push) {
                objectedForm[this.name] = [objectedForm[this.name]];
            }
            objectedForm[this.name].push(this.value || '');
        } else {
            objectedForm[this.name] = this.value || '';
        }
    });
    return objectedForm;
};


function controlZIP(){
  if($('#zipcode').val()!=""){
    if(!is_numeric($('#zipcode').val())){
      var id = $(this).attr("id");
      showModalError("Errore","Il CAP è formato da numeri.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
      return false;
    }
    if($('#zipcode').val().length>5)
      var id = $(this).attr("id");
      showModalError("Errore","Il CAP è formato da 5 cifre.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
      return false;
  }

}
function controlFC(){
  if($('#fiscal_code').val()!="")
    if($('#fiscal_code').val().length>16)
      var id = $(this).attr("id");
      showModalError("Errore","Il codice fiscale è formato da 11 caratteri.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
      return false;
}

//vecchie
function is_date(aaaa,mm,gg){
  var res=true;
  mmNew = parseFloat(mm)-1;
  mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
  var dteDate=new Date(aaaa,mm,gg);
  if (!((gg==dteDate.getDate()) && (mm==dteDate.getMonth()) && (aaaa==dteDate.getFullYear())))
    res=false;
  return res;
}
function is_email(email){
  var res=0;
  email=trim(email);
  if(window.RegExp){
    var rexp=new RegExp("^[_a-zA-Z0-9-]+(\\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*(\\.([a-zA-Z]){2,4})$");
    if(rexp.test(email))
      res=1;
  }else{
    if((email.indexOf("@") > 0) && (email.indexOf(".") > 0))
      res=1;
  }
  return res;
}
function trim(str) {
  var res="";
  if(str){
    if(str.length>0){
      res=ltrim(rtrim(str, "\\s"), "\\s");
    }
  }
  return res;
}
function ltrim(str, chars) {
//  chars = chars || "\\s";
  return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
  chars = chars || "\\s";
  return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}
*/
