/*!
* Spielbericht v1.0.0 (http://bdlonlinespielbericht.lima-city.de)
* Copyright 2015 Marius Augenstein.
*/

var heim = unescape(getUrlParameter("heim"));
var gast = unescape(getUrlParameter("gast"));
var newGame = unescape(getUrlParameter("neuesSpiel"));
var spiel = getUrlParameter("spiel").replace(/\+/g,' ');
var aVereine = [];

var ergebnisse = (newGame==="true") ? undefined : JSON.parse(window.localStorage.getItem("ergebnisse"));

if (ergebnisse) {
	readNewGameFromURL(ergebnisse, spiel);
	window.localStorage.setItem("ergebnisse", JSON.stringify(ergebnisse));
	printTable(ergebnisse);
} else {
	$.getJSON("data/ergebnisse.json", function(ergebnisse) {
	  ergebnisse.heim = heim;
	  ergebnisse.gast = gast;

	  readNewGameFromURL(ergebnisse, spiel);

	  window.localStorage.setItem("ergebnisse", JSON.stringify(ergebnisse));

	  printTable(ergebnisse);
	});
}

$.getJSON("data/vereine.json", function(oVereine) {
	var heimSelectS = $('#name1');
	var heimSelectD1 = $('#heimname1');
	var heimSelectD2 = $('#heimname2');
	for (var i = 0; i<oVereine[heim].mitglieder.length; i++) {
	   var spieler = atob(oVereine[heim].mitglieder[i].vorname) + " " + atob(oVereine[heim].mitglieder[i].name);
	   heimSelectS.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	   heimSelectD1.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	   heimSelectD2.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	}	

	var gastSelectS = $('#name2');
	var gastSelectD1 = $('#gastname1');
	var gastSelectD2 = $('#gastname2');
	for (var i = 0; i<oVereine[gast].mitglieder.length; i++) {
	   var spieler = atob(oVereine[gast].mitglieder[i].vorname) + " " + atob(oVereine[gast].mitglieder[i].name);
	   gastSelectS.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	   gastSelectD1.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	   gastSelectD2.append($('<option></option>', {
	      value: btoa(spieler),
	      text: spieler
	   }));
	}
});

switchMore("more1", false, 0);
switchMore("more2", false, 0);
switchMore("dmore1", false, 0);
switchMore("dmore2", false, 0);
switchMore("dmore3", false, 0);
switchMore("dmore4", false, 0);
document.getElementById("heimFeldInTable").innerHTML = atob(heim);
document.getElementById("gastFeldInTable").innerHTML = atob(gast);
$("#heim").val(heim);
$("#gast").val(gast);

// ***************************************************************************
// ** FUNCTION SECTION
// ***************************************************************************

/**
 * [generateUID Generates a Random UID of 4 digits]
 * @return {[string]}
 */		
function generateUID() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
};

/**
 * [checkSelection description]
 * @return {[type]}
 */
function checkSelection() {
	var bEinzel = (document.getElementById("spiel").value[0] === 'e');
	var erg1 = parseInt(document.querySelector('input[name="erg1"]:checked').value);
	var erg2 = parseInt(document.querySelector('input[name="erg2"]:checked').value);
	if (bEinzel) {
	  if (erg1===3 || erg2===3) {
	    document.getElementById("speichern").disabled = (erg1===3 && erg2===3);
	  } else {
	    document.getElementById("speichern").disabled = true;
	  }
	} else {
	  if (erg1===3 || erg2===3) {
	    var bNamesOk = checkNames();
	    var bBothThree = (erg1===3 && erg2===3);
	    document.getElementById("speichern").disabled = !(!bBothThree && bNamesOk);
	  } else {
	    document.getElementById("speichern").disabled = true;
	  }
	}
};

function checkNames() {
	var sHeimName1 = document.getElementById("heimname1").value;
	var sHeimName2 = document.getElementById("heimname2").value;
	var sGastName1 = document.getElementById("gastname1").value;
	var sGastName2 = document.getElementById("gastname2").value;

	return (sHeimName1 != sHeimName2 && sGastName1 != sGastName2);
};

function walkDOM(node, func) {
	func(node);
	node = node.firstChild;
	while(node) {
	  walkDOM(node,func);
	  node = node.nextSibling;
	}
};

function fillHiddenFields() {
	removeBorders();
	$("#hiddenSummaryTableContainer").empty();
	$("#summaryTable").clone().appendTo("#hiddenSummaryTableContainer");

	walkDOM(document.getElementById("hiddenSummaryTableContainer"), function(oNode) {
	  if (oNode && oNode.hasAttribute && oNode.hasAttribute("onclick")){
	    oNode.removeAttribute("onclick");
	  }
	});

	document.getElementById("emailSummaryTable").value = $("#hiddenSummaryTableContainer").html();
	document.getElementById("ergebnisJSON").value = JSON.stringify(ergebnisse);

	$.get("styles/ergebnistabelle.css", function(oContent) {
	  document.getElementById("emailCSSStyles").value = oContent;
	});
};

function getUrlParameter(sParam){
  var sReturn = "";
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
        sReturn = sParameterName[1];
      }
  }
  return sReturn;
};

function printTable(ergebnisse) {
	var team1Legs = 0;
	var team1Sets = 0;
	var team2Legs = 0;
	var team2Sets = 0;
	var lineCounter = 1;
	for (var erg in ergebnisse) {
	  if (ergebnisse[erg].spieler1 && ergebnisse[erg].spieler2) {
	    var classSpec = (lineCounter % 2 === 0) ? "einzelblockEven" : "einzelblockOdd";
	    var uid = generateUID();
	    var line = "<tr id='" + uid + "' class='"+classSpec+"' onclick='enableFormForSingles(true, " + lineCounter + ", \"" + uid + "\")'>"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler1.shortlegs) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler1.highfinishes) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler1.i180er) + "</td>\n"+
	                  "<td>" + ergebnisse[erg].spieler1.name + "</td>\n"+
	                  "<td class='ergebnisBlock'>" + ergebnisse[erg].spieler1.legs + " : " + ergebnisse[erg].spieler2.legs + "</td>\n"+
	                  "<td>" + ergebnisse[erg].spieler2.name + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler2.i180er) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler2.highfinishes) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].spieler2.shortlegs) + "</td>\n"+
	               "</tr>";
	    $('#summaryTable tr:last').after(line);
	    lineCounter++;
	    team1Legs += parseInt(ergebnisse[erg].spieler1.legs);
	    team2Legs += parseInt(ergebnisse[erg].spieler2.legs);
	    if (ergebnisse[erg].spieler1.legs>ergebnisse[erg].spieler2.legs) {
	      team1Sets++;
	    } else if (ergebnisse[erg].spieler1.legs<ergebnisse[erg].spieler2.legs) {
	      team2Sets++;
	    }
	  } else if (ergebnisse[erg].paar1 && ergebnisse[erg].paar2) {
	    var classSpec = (lineCounter % 2 === 0) ? "doppelblockEven" : "doppelblockOdd";
	    var uid = generateUID();

	    var line = "<tr id='" + uid + "_1' class='"+classSpec+"' onclick='enableFormForSingles(false, " + lineCounter + ", \"" + uid + "_1\")'>"+
	                  "<td rowspan='2' class='slhf180block'>" + p(ergebnisse[erg].paar1.shortlegs) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler1.highfinishes) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler1.i180er) + "</td>\n"+
	                  "<td>" + ergebnisse[erg].paar1.spieler1.name + "</td>\n"+
	                  "<td rowspan='2' class='ergebnisBlock'>" + ergebnisse[erg].paar1.legs + " : " + ergebnisse[erg].paar2.legs + "</td>\n"+
	                  "<td>" + ergebnisse[erg].paar2.spieler1.name + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler1.i180er) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler1.highfinishes) + "</td>\n"+
	                  "<td rowspan='2' class='slhf180block'>" + p(ergebnisse[erg].paar2.shortlegs) + "</td>\n"+
	                "</tr>\n"+
	                "<tr id='" + uid + "_2' class='"+classSpec+"' onclick='enableFormForSingles(false, " + lineCounter + ", \"" + uid + "_2\")'>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler2.highfinishes) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler2.i180er) + "</td>\n"+
	                  "<td>" + ergebnisse[erg].paar1.spieler2.name + "</td>\n"+
	                  "<td>" + ergebnisse[erg].paar2.spieler2.name + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler2.i180er) + "</td>\n"+
	                  "<td class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler2.highfinishes) + "</td>\n"+
	                "</tr>";
	    $('#summaryTable tr:last').after(line);
	    lineCounter++;
	    team1Legs += parseInt(ergebnisse[erg].paar1.legs);
	    team2Legs += parseInt(ergebnisse[erg].paar2.legs);
	    if (ergebnisse[erg].paar1.legs>ergebnisse[erg].paar2.legs) {
	      team1Sets++;
	    } else if (ergebnisse[erg].paar1.legs<ergebnisse[erg].paar2.legs) {
	      team2Sets++;
	    }
	  }
	}
	var line = "<tr class='summaryBlock'>"+
	              "<td colspan=3 rowspan=2>&nbsp;</td>\n"+
	              "<td rowspan=2>Ergebnis:</td>\n"+
	              "<td nowrap>" + team1Legs + " : " + team2Legs + "</td>\n"+
	              "<td> - Legs</td>\n"+
	              "<td colspan=3>&nbsp;</td>\n"+
	           "</tr>"+
	           "<tr class='summaryBlock'>"+
	              "<td>" + team1Sets + " : " + team2Sets + "</td>\n"+
	              "<td> - Sets</td>\n"+
	              "<td colspan=3>&nbsp;</td>\n"+
	           "</tr>";
	$('#summaryTable tr:last').after(line);
};

function p(sErg) {
	return (sErg == 0) ? "&nbsp;" : sErg;
};

function readNewGameFromURL(ergebnisse, spiel) {
	if (!spiel) {
	  return;
	}

	if (ergebnisse[spiel].spieler1) {
	  ergebnisse[spiel].spieler1 = { 
	    "name" : atob(unescape(getUrlParameter("name1"))), 
	    "legs" : getUrlParameter("erg1") || 0, 
	    "shortlegs" : getUrlParameter("sl1") || 0, 
	    "highfinishes" : getUrlParameter("hf1") || 0, 
	    "i180er" : getUrlParameter("i180er1") || 0 
	  };
	};

	if (ergebnisse[spiel].spieler2) {
	  ergebnisse[spiel].spieler2 = { 
	    "name" : atob(unescape(getUrlParameter("name2"))), 
	    "legs" : getUrlParameter("erg2") || 0, 
	    "shortlegs" : getUrlParameter("sl2") || 0, 
	    "highfinishes" : getUrlParameter("hf2") || 0, 
	    "i180er" : getUrlParameter("i180er2") || 0 
	  };
	};

	if (ergebnisse[spiel].paar1) {
	  ergebnisse[spiel].paar1 = { 
	    "legs" : getUrlParameter("erg1") || 0,
	    "shortlegs" : getUrlParameter("dsl1") || 0,
	    "spieler1" : {
	      "name" : atob(unescape(getUrlParameter("heimname1"))), 
	      "highfinishes" : getUrlParameter("dhf1") || 0,
	      "i180er" : getUrlParameter("di180er1") || 0
	    },
	    "spieler2" : {
	      "name" : atob(unescape(getUrlParameter("heimname2"))), 
	      "highfinishes" : getUrlParameter("dhf2") || 0,
	      "i180er" : getUrlParameter("di180er2") || 0
	    }
	  };
	};

	if (ergebnisse[spiel].paar2) {
	  ergebnisse[spiel].paar2 = { 
	    "legs" : getUrlParameter("erg2") || 0,
	    "shortlegs" : getUrlParameter("dsl2") || 0,
	    "spieler1" : {
	      "name" : atob(unescape(getUrlParameter("gastname1"))), 
	      "highfinishes" : getUrlParameter("dhf3") || 0,
	      "i180er" : getUrlParameter("di180er3") || 0
	    },
	    "spieler2" : {
	      "name" : atob(unescape(getUrlParameter("gastname2"))), 
	      "highfinishes" : getUrlParameter("dhf4") || 0,
	      "i180er" : getUrlParameter("di180er4") || 0
	    }
	  };
	};
};

function removeBorders() {
	$(".singleRowSelected").removeClass("singleRowSelected");
	$(".doubleRowSelectedTop").removeClass("doubleRowSelectedTop");
	$(".doubleRowSelectedBottom").removeClass("doubleRowSelectedBottom");
};

function enableFormForSingles(bSingles, lineCounter, uid) {
	removeBorders();

	if (uid.length>4) {
	  var tmpId = uid.substring(0,4);
	  $("#" + tmpId + "_1").addClass("doubleRowSelectedTop");
	  $("#" + tmpId + "_2").addClass("doubleRowSelectedBottom");
	} else {
	  $("#" + uid).addClass("singleRowSelected");
	}

	var ergebnisse = JSON.parse(window.localStorage.getItem("ergebnisse"));
	var oStoredNames = {};

	switch (lineCounter) {
	    case 1:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 1 (Einzel) - Spiel 1</h4>";
	        document.getElementById('spiel').value = "e1b1";
	        oStoredNames = getStoredNames(1, ergebnisse);
	        break;
	    case 2:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 1 (Einzel) - Spiel 2</h4>";
	        document.getElementById('spiel').value = "e2b1";
	        oStoredNames = getStoredNames(1, ergebnisse);
	        break;
	    case 3:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 1 (Einzel) - Spiel 3</h4>";
	        document.getElementById('spiel').value = "e3b1";
	        oStoredNames = getStoredNames(1, ergebnisse);
	        break;
	    case 4:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 1 (Einzel) - Spiel 4</h4>";
	        document.getElementById('spiel').value = "e4b1";
	        oStoredNames = getStoredNames(1, ergebnisse);
	        break;
	    case 5:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 2 (Doppel) - Spiel 1</h4>";
	        document.getElementById('spiel').value = "d1b2";
	        oStoredNames = getStoredNames(2, ergebnisse);
	        break;
	    case 6:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 2 (Doppel) - Spiel 2</h4>";
	        document.getElementById('spiel').value = "d2b2";
	        oStoredNames = getStoredNames(2, ergebnisse);
	        break;
	    case 7:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 3 (Einzel) - Spiel 1</h4>";
	        document.getElementById('spiel').value = "e1b3";
	        oStoredNames = getStoredNames(3, ergebnisse);
	        break;
	    case 8:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 3 (Einzel) - Spiel 2</h4>";
	        document.getElementById('spiel').value = "e2b3";
	        oStoredNames = getStoredNames(3, ergebnisse);
	        break;
	    case 9:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 3 (Einzel) - Spiel 3</h4>";
	        document.getElementById('spiel').value = "e3b3";
	        oStoredNames = getStoredNames(3, ergebnisse);
	        break;
	    case 10:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 3 (Einzel) - Spiel 4</h4>";
	        document.getElementById('spiel').value = "e4b3";
	        oStoredNames = getStoredNames(3, ergebnisse);
	        break;
	    case 11:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 4 (Doppel) - Spiel 1</h4>";
	        document.getElementById('spiel').value = "d1b4";
	        oStoredNames = getStoredNames(4, ergebnisse);
	        break;
	    case 12:
	        document.getElementById('spielHeadline').innerHTML = "<h4>Block 4 (Doppel) - Spiel 2</h4>";
	        document.getElementById('spiel').value = "d2b4";
	        oStoredNames = getStoredNames(4, ergebnisse);
	        break;
	}
	document.getElementById("speichern").style.display = "inherit";
	$("#ergSelection").css("visibility","visible"); 
	$("#spielerHeim > #inputsForSingleHome").appendTo("#hiddenInputFieldContainer");
	$("#spielerHeim > #inputsForDoubleHome").appendTo("#hiddenInputFieldContainer");
	$("#spielerGast > #inputsForSingleGuest").appendTo("#hiddenInputFieldContainer");
	$("#spielerGast > #inputsForDoubleGuest").appendTo("#hiddenInputFieldContainer");

	var sSpiel = document.getElementById('spiel').value;
	if (bSingles) {
		$("#hiddenInputFieldContainer > #inputsForSingleHome").appendTo("#spielerHeim");  
		$("#hiddenInputFieldContainer > #inputsForSingleGuest").appendTo("#spielerGast");
		organizeSelectedOptionsForId(oStoredNames, "name1", sSpiel, ergebnisse);
		organizeSelectedOptionsForId(oStoredNames, "name2", sSpiel, ergebnisse);
	} else {
		$("#hiddenInputFieldContainer > #inputsForDoubleHome").appendTo("#spielerHeim");  
		$("#hiddenInputFieldContainer > #inputsForDoubleGuest").appendTo("#spielerGast"); 
		organizeSelectedOptionsForId(oStoredNames, "heimname1", sSpiel, ergebnisse);
		organizeSelectedOptionsForId(oStoredNames, "heimname2", sSpiel, ergebnisse);
		switchSameSelectedOptionFor("heimname1", "heimname2");
		organizeSelectedOptionsForId(oStoredNames, "gastname1", sSpiel, ergebnisse);
		organizeSelectedOptionsForId(oStoredNames, "gastname2", sSpiel, ergebnisse);
		switchSameSelectedOptionFor("gastname1", "gastname2");
	}
	document.getElementById("speichern").scrollIntoView(); 
};

function switchSameSelectedOptionFor(sId1, sId2) {
	var oSelection1 = document.getElementById(sId1);
	var oSelection2 = document.getElementById(sId2);
	if (oSelection1.selectedIndex == oSelection2.selectedIndex) {
	  var oOptions2 = oSelection2.options;
	  for (var i = 0; i < oOptions2.length; i++) {
	    if (!oOptions2.item(i).selected && oOptions2.item(i).style.display !== "none") {
	      oOptions2.item(i).selected = true;
	      break;
	    }
	  };
	}
};

function organizeSelectedOptionsForId(oStoredNames, sId, sSpiel, ergebnisse) {
	var bSingle = (sSpiel.substring(0,1)==="e");

	var oOptions = document.getElementById(sId).options;
	for (var i = 0; i<oOptions.length; i++) {
	  if (oOptions.item(i).hasAttribute("style")) {
	    oOptions.item(i).removeAttribute("style")
	  }
	}
	for (var i = 0; i<oOptions.length; i++) {
	  if (oStoredNames[oOptions.item(i).text]) {
	    if(bSingle) {
	      oOptions.item(i).style.display = (oOptions.item(i).text == ergebnisse[sSpiel].spieler1.name || oOptions.item(i).text == ergebnisse[sSpiel].spieler2.name) ? "inherit" : "none";
	    } else {
	      oOptions.item(i).style.display = (oOptions.item(i).text == ergebnisse[sSpiel].paar1.spieler1.name 
	                                     || oOptions.item(i).text == ergebnisse[sSpiel].paar1.spieler2.name
	                                     || oOptions.item(i).text == ergebnisse[sSpiel].paar2.spieler1.name
	                                     || oOptions.item(i).text == ergebnisse[sSpiel].paar2.spieler2.name) ? "inherit" : "none";
	    }
	  }
	}

	for (var i = 0; i<oOptions.length; i++) {
	  if (oOptions.item(i).style.display !== "none") {
	    oOptions.item(i).selected = true;
	    break;
	  }
	}
};

function getStoredNames(blockNumber, ergebnisse) {
	var oRet = {};
	switch (blockNumber) {
	    case 1:
	        oRet[ergebnisse.e1b1.spieler1.name] = {};
	        oRet[ergebnisse.e1b1.spieler2.name] = {};
	        oRet[ergebnisse.e2b1.spieler1.name] = {};
	        oRet[ergebnisse.e2b1.spieler2.name] = {};
	        oRet[ergebnisse.e3b1.spieler1.name] = {};
	        oRet[ergebnisse.e3b1.spieler2.name] = {};
	        oRet[ergebnisse.e4b1.spieler1.name] = {};
	        oRet[ergebnisse.e4b1.spieler2.name] = {};
	        break;
	    case 2:
	        oRet[ergebnisse.d1b2.paar1.spieler1.name] = {};
	        oRet[ergebnisse.d1b2.paar1.spieler2.name] = {};
	        oRet[ergebnisse.d1b2.paar2.spieler1.name] = {};
	        oRet[ergebnisse.d1b2.paar2.spieler2.name] = {};
	        oRet[ergebnisse.d2b2.paar1.spieler1.name] = {};
	        oRet[ergebnisse.d2b2.paar1.spieler2.name] = {};
	        oRet[ergebnisse.d2b2.paar2.spieler1.name] = {};
	        oRet[ergebnisse.d2b2.paar2.spieler2.name] = {};
	        break;
	    case 3:
	        oRet[ergebnisse.e1b3.spieler1.name] = {};
	        oRet[ergebnisse.e1b3.spieler2.name] = {};
	        oRet[ergebnisse.e2b3.spieler1.name] = {};
	        oRet[ergebnisse.e2b3.spieler2.name] = {};
	        oRet[ergebnisse.e3b3.spieler1.name] = {};
	        oRet[ergebnisse.e3b3.spieler2.name] = {};
	        oRet[ergebnisse.e4b3.spieler1.name] = {};
	        oRet[ergebnisse.e4b3.spieler2.name] = {};
	        break;
	    case 4:
	        oRet[ergebnisse.d1b4.paar1.spieler1.name] = {};
	        oRet[ergebnisse.d1b4.paar1.spieler2.name] = {};
	        oRet[ergebnisse.d1b4.paar2.spieler1.name] = {};
	        oRet[ergebnisse.d1b4.paar2.spieler2.name] = {};
	        oRet[ergebnisse.d2b4.paar1.spieler1.name] = {};
	        oRet[ergebnisse.d2b4.paar1.spieler2.name] = {};
	        oRet[ergebnisse.d2b4.paar2.spieler1.name] = {};
	        oRet[ergebnisse.d2b4.paar2.spieler2.name] = {};
	        break;
	}
	return oRet;
};

function switchMore(sId, bShow, duration) {
	if (bShow) {
		if (duration == 0) {
			jQuery("#" + sId).show();
		} else {
			jQuery("#" + sId).show(200);
		}
		jQuery("#link" + sId).text("Less -");
	} else {
		if (duration == 0) {
			jQuery("#" + sId).hide();
		} else {
			jQuery("#" + sId).hide(200);
		}
		jQuery("#link" + sId).text("More +");
	}
};

