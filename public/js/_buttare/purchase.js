var queryResult;
$(function() {
	$(".disabled").attr('disabled', 'disabled');
	var doc_from = $("#doc_from");
	doc_from.bind("keypress", function(event) {
		if ($("#customer_id").val()!="" &&  event.keyCode != 13) {
			$("#customer_id").val("");
			$(".street").val("");
			$(".zipcode").val("");
			$(".city").val("");
			$(".province").val("");
			$(".country").val("");
			$(".countrycode").val("");
			$(".countrycode_visible").html("");
			$(".vat_number").val("");
			$(".fiscal_code").val("");
			$(".unique_code").val("");
			$(".pec").val("");
			$("#italyonly").hide();
		}
	});
	
	//autocomplete
	doc_from.autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/accounting/customers");
			var x = [];
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i].name, "value" : queryResult[i].name, idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			var i= ui.item.idx;
			$("#customer_id").val(queryResult[i]._id);
			$(".street").val(queryResult[i].address.street);
			$(".zipcode").val(queryResult[i].address.zipcode);
			$(".city").val(queryResult[i].address.city);
			$(".province").val(queryResult[i].address.province);
			$(".country").val(queryResult[i].address.country);
			$(".countrycode").val(queryResult[i].address.countrycode);
			$(".countrycode_visible").html(queryResult[i].address.countrycode);
			$(".vat_number").val(queryResult[i].vat_number);
			$(".fiscal_code").val(queryResult[i].fiscal_code);
			$(".unique_code").val(queryResult[i].unique_code);
			$(".pec").val(queryResult[i].pec);
			if (queryResult[i].address.country == "Italy") {
				$("#italyonly").show();
			} else {
				$("#italyonly").hide();
			} 
		}
	});
	$('#payment').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/accounting/payments");
			var x = [];
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			//console.log(ui);
		}
	});

	$("#purchase").submit(function() {
		$(".disabled").removeAttr('disabled');
		return checkPurchase();
	});
	
	// datepicker
	$("#delivery_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
	
	$("#doc_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true/* ,
		onSelect: checkDate */
	});
	
	// Binds
	$("#vat_perc").bind("blur", function() {
		updateTotal();
	});
	$("#shipping_costs").bind("blur", function() {
		updateTotal();
	});
	setBinds();
	accounting.settings = _config.accountingSettings;
});

function getAutoCompleteList(req, url){
	$.ajax({
        'async': false,
		url: url,
		dataType: "json",
		data: {
			term: req.term
		},
		success: function( data ) {
	        queryResult=data;
		}
	});
}
function showOffers() {
	$('.modal-alert .modal-title').html("Offers");
	showModal("alert", "Loading...");
	$.ajax({
		'async': false,
		url: "/api/accounting/offers",
		dataType: "json",
		success: function( data ) {
			var str = "<div class=\"list-group\">";
			for(var a=0;a<data.result.length;a++){
				var d = new Date(data.result[a].doc_date);
				var date = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
				str+="<a href=\"#\" onclick=\"setOffer('"+data.result[a]._id+"','"+date+"','"+data.result[a].doc_number+"');\" class=\"list-group-item\"><h4 class=\"list-group-item-heading\"><span class=\"label label-default\">"+data.result[a].doc_number+"</span> "+date+" "+data.result[a].doc_from.name+"</h4><p class=\"list-group-item-text\">"+data.result[a].description+"</p></a>"
			}
			str+= "</div>";
			$('.modal-alert .modal-body').html(str);
		}
	});
}
function setOffer(_id,date,doc_number) {
	$('#offer_id').val(_id);
	$('#doc_number').val(doc_number);
	$('#doc_date').val(date);
	$('#offer_url').attr('href', '/offer/?id='+_id).removeAttr('disabled');
	$('.modal-alert').modal('hide');
	return false;
}

function setBinds(){
	$(".quantity").unbind("blur").bind("blur",function() {
		checkQuantity($(this));
		getAmount($(this).parent().parent());
		updateTotal();
	});
	$(".price").unbind("blur").bind("blur",function() {
		if(checkPrice($(this))) $(this).val(accounting.formatMoney(accounting.unformat($(this).val(), ",")));
		getAmount($(this).parent().parent().parent());
		updateTotal();
	});
	$('.description').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/accounting/products");
			var x = [];
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			//console.log(ui);
		}
	});

}

function checkQuantity(input){
	if(!is_numeric(input.val())){
		var id = input.attr("id");
		showModal('error', "La quantità è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkPrice(input){
	if(!is_numeric(accounting.unformat(input.val(), ","))){
		var id = input.attr("id");
		showModal('error', "Il prezzo è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkShippingCosts(input){
	if(input.val()!="" && !is_numeric(accounting.unformat(input.val()))){
		var id = input.attr("id");
		showModal('error', "L'importo deve essere un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkVATPerc(input){
	if(!is_numeric(input.val())){
		var id = input.attr("id");
		showModal('error', "L'IVA percentuale non è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	} else if(input.val()>100||input.val()<0) {
		var id = input.attr("id");
		showModal('error', "L'IVA percentuale deve essere compresa tra 0 e 100.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	} else {
		return true;
	}
}

function checkPurchase(){
	var res = true;
	// Check _id customer
	if (!$("#customer_id").val()){
		showModal('error', "Selezionare una ragione sociale", function () {setTimeout("\$(\"#customer_id\").focus()",50)});
		res = false;
	}
	// Check counts
	return res;
}

function getAmount(row){
	if (is_numeric(row.find(".quantity").val()) && is_numeric(accounting.unformat(row.find(".price").val(), ","))) {
		row.find(".amount").val(accounting.formatMoney(row.find(".quantity").val()*accounting.unformat(row.find(".price").val(), ",")));
	}
}

function updateTotal(){
	var subtot=0;
	var vat_perc = $('#vat_perc');
	var shipping_costs = $('#shipping_costs');
	$('.amount').each(function(){
		if($(this).val()!="")
			subtot += parseFloat(accounting.unformat($(this).val(), ","));
	});
	$('#subtotal').val(accounting.formatMoney(subtot));
	var failed = false;
	if (checkVATPerc(vat_perc)) {
		$('.vat_amount').val(accounting.formatMoney((subtot/100)*vat_perc.val()));
	} else {
		failed = true;
	}
	if(checkShippingCosts(shipping_costs)) {
		shipping_costs.val(accounting.formatMoney(accounting.unformat(shipping_costs.val(), ",")));
	} else {
		failed = true;
	}
	var tot;
	if (failed) {
		tot = "";
	} else {
		tot = 0;
		$('.totals').each(function(){
			if($(this).val()!="")
				tot += parseFloat(accounting.unformat($(this).val(), ","));
		});
	}
	$('.total').val(accounting.formatMoney(tot));
}

//Add row to table
function addNewRow(){
	$("#items tr:last").clone().find("input,textarea").each(function() {
		$(this).val('');
	}).end().appendTo("#items");
	resetItemNamesAndIDs();
	setBinds();
}

function resetItemNamesAndIDs(){
	$("#items tr").each(function(index) {
		$(this).find("input,textarea").each(function() {
			$(this).attr({
				'id': function(_, id) { return (id.slice(0, id.lastIndexOf("_"))) + "_" + index },
				'name': function(_, name) { return (name = name.substring(0,name.indexOf("[")+1)+index+name.substring(name.indexOf("]")))},
			});
		});
	});
}


function removeRow(t){
	if($(t).parent().parent().parent().find(".price").length>1) {
		$(t).parent().parent().remove();
	}
	resetItemNamesAndIDs();
	updateTotal();
}



var progress = document.querySelector('.percent');
var res = [];

function errorHandler(evt) {
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
}

function updateProgress(evt) {
	// evt is an ProgressEvent.
	if (evt.lengthComputable) {
		var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		// Increase the progress bar length.
		if (percentLoaded < 100) {
			progress.style.width = percentLoaded + '%';
			progress.textContent = percentLoaded + '%';
		}
	}
}

function handleFileSelect(evt) {
	// Reset progress indicator on new file selection.
	progress.style.width = '0%';
	progress.textContent = '0%';
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.target.files ? evt.target.files : evt.dataTransfer.files;
	//var files = evt.dataTransfer.files; // FileList object.
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
								f.size, ' bytes, last modified: ',
								f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
								'</li>');
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
		var reader = new FileReader();
		function abortRead() {
			reader.abort();
		}
		reader.onerror = errorHandler;
		reader.onprogress = updateProgress;
		reader.onabort = function(e) {
			alert('File read cancelled');
		};
		reader.onloadstart = function(e) {
			document.getElementById('progress_bar').className = 'loading';
		};
		reader.onload = function(e) {
			res.push(e.target.result);
			if (res.length == files.length) console.log(res);
			// Ensure that the progress bar displays 100% at the end.
			progress.style.width = '100%';
			progress.textContent = '100%';
			setTimeout("document.getElementById('progress_bar').className='';", 2000);
		}

		// Read in the image file as a binary string.
		reader.readAsBinaryString(files[i]);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
if (document.getElementById('files')) {
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
}
