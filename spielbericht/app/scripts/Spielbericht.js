/*!
* Spielbericht v1.0.0 (http://bdlonlinespielbericht.lima-city.de)
* Copyright 2015 Marius Augenstein.
*/

// ***************************************************************************
// ** FUNCTION SECTION
// ***************************************************************************

/**
 * [generateUID Generates a Random UID of 4 digits]
 * @return {[string]}
 */		

function updateStatistic(ergebnisse) {
	var scores = ergebnisse.statistik || [];

	scores.sort(function(a,b){
		return b.score - a.score;
	});
	printScoresTable(scores);
};

function setUpSelections() {

//	$('select[name=name1]').selectpicker();
//	$('select[name=heimname1]').selectpicker();
//	$('select[name=heimname2]').selectpicker();
	
//	$('select[name=name2]').selectpicker();
//	$('select[name=gastname1]').selectpicker();
//	$('select[name=gastname2]').selectpicker();

	var nachmeldungen = JSON.parse(window.localStorage.getItem("nachmeldungen"));
	
	var aSpielerHeim = [];
	var aSpielerGast = [];

	for (var i = 0; i<vereine[ergebnisse.heim].mitglieder.length; i++) {
		aSpielerHeim.push(atob(vereine[ergebnisse.heim].mitglieder[i].name) + ", " + atob(vereine[ergebnisse.heim].mitglieder[i].vorname));
	};
	aSpielerHeim.sort();
	$('#name1').empty();
	$('#heimname1').empty();
	$('#heimname2').empty();

	for (var i = 0; i<aSpielerHeim.length; i++) {
		var spieler = aSpielerHeim[i];
		$('#name1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#heimname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#heimname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
	};

	for (var i = 0; i<nachmeldungen.heim.length; i++) {
		var spieler = unescape(atob(nachmeldungen.heim[i]));
		if (spieler != "") {
			$('#name1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#heimname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#heimname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		}
	};

	for (var i = 0; i<vereine[ergebnisse.gast].mitglieder.length; i++) {
		aSpielerGast.push(atob(vereine[ergebnisse.gast].mitglieder[i].name) + ", " + atob(vereine[ergebnisse.gast].mitglieder[i].vorname));
	};
	aSpielerGast.sort();
	$('#name2').empty();
	$('#gastname1').empty();
	$('#gastname2').empty();

	for (var i = 0; i<aSpielerGast.length; i++) {
		var spieler = aSpielerGast[i];
		$('#name2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#gastname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#gastname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
	};

	for (var i = 0; i<nachmeldungen.gast.length; i++) {
		var spieler = unescape(atob(nachmeldungen.gast[i]));
		if (spieler != "") {
			$('#name2').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#gastname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#gastname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		}
	};
	$('.selectpicker').selectpicker('refresh');
};

function printScoresTable(scores) {
	var highestScore = findHighestScore(scores);
	emptyTable("scoresTable");
	
	for(var i = 0; i<scores.length; i++) {
		var styleClass = "score";
		var currentScore = scores[i].score;
		switch (i) {
		    case 0:
		        styleClass = "scoreGold";
		        break;
		    case 1:
		        styleClass = "scoreSilver";
		        break;
		    case 2:
		        styleClass = "scoreBronze";
		        break;
		}
		var line = 
			"<tr>"+
	            "<td class='nameCell'>" + scores[i].name + "</td>\n"+
	            "<td><div class='" + styleClass + "' style='width:" + calculateWidth(highestScore, currentScore) + "%'>&nbsp;</div></td>\n"+
	            "<td class='scoreCell'>" + currentScore + "</td>\n"+
        	"</tr>";
		$('#scoresTable > tbody tr:last').after(line);
	};
};

function findHighestScore(scores) {
	var iHighestScore = 0;
	for (var i = scores.length - 1; i >= 0; i--) {
		if (scores[i].score > iHighestScore) {
			iHighestScore = scores[i].score;
		}
	};
	return iHighestScore;
};

function calculateWidth(highestScore, currentScore) {
	return currentScore * 100 / highestScore;
};

function prepareStatistic(ergebnisse) {
	ergebnisse["statistik"] = [];

	var aSpiele = Object.keys(ergebnisse);
	for (var i = 0; i < aSpiele.length; i++) {
		var oSpiel = aSpiele[i];
		if (ergebnisse[oSpiel].spieler1 && ergebnisse[oSpiel].spieler1.name!="" && ergebnisse[oSpiel].spieler2.name!="") {
			// Einzel
			var score = calcScoreForPlayer(true, 
				ergebnisse[oSpiel].spieler1.legs,
				ergebnisse[oSpiel].spieler1.i180er,
				ergebnisse[oSpiel].spieler1.shortlegs,
				ergebnisse[oSpiel].spieler1.highfinishes);
			console.log("EINZEL", ergebnisse[oSpiel].spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].spieler1.name, score);

			var score = calcScoreForPlayer(true, 
				ergebnisse[oSpiel].spieler2.legs,
				ergebnisse[oSpiel].spieler2.i180er,
				ergebnisse[oSpiel].spieler2.shortlegs,
				ergebnisse[oSpiel].spieler2.highfinishes);
			console.log("EINZEL", ergebnisse[oSpiel].spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].spieler2.name, score);
		}
		if (ergebnisse[oSpiel].paar1 && ergebnisse[oSpiel].paar1.spieler1.name!="" && ergebnisse[oSpiel].paar1.spieler2.name!="") {
			// Doppel 1
			var score = calcScoreForPlayer(false, 
				ergebnisse[oSpiel].paar1.legs,
				ergebnisse[oSpiel].paar1.spieler1.i180er,
				ergebnisse[oSpiel].paar1.shortlegs,
				ergebnisse[oSpiel].paar1.spieler1.highfinishes);
			console.log("DOPPEL", ergebnisse[oSpiel].paar1.spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar1.spieler1.name, score);

			var score = calcScoreForPlayer(false, 
				ergebnisse[oSpiel].paar1.legs,
				ergebnisse[oSpiel].paar1.spieler2.i180er,
				ergebnisse[oSpiel].paar1.shortlegs,
				ergebnisse[oSpiel].paar1.spieler2.highfinishes);
			console.log("DOPPEL", ergebnisse[oSpiel].paar1.spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar1.spieler2.name, score);
		}
		if (ergebnisse[oSpiel].paar2 && ergebnisse[oSpiel].paar2.spieler1.name!="" && ergebnisse[oSpiel].paar2.spieler2.name!="") {
			// Doppel 2
			var score = calcScoreForPlayer(false, 
				ergebnisse[oSpiel].paar2.legs,
				ergebnisse[oSpiel].paar2.spieler1.i180er,
				ergebnisse[oSpiel].paar2.shortlegs,
				ergebnisse[oSpiel].paar2.spieler1.highfinishes);
			console.log("DOPPEL", ergebnisse[oSpiel].paar2.spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar2.spieler1.name, score);

			var score = calcScoreForPlayer(false, 
				ergebnisse[oSpiel].paar2.legs,
				ergebnisse[oSpiel].paar2.spieler2.i180er,
				ergebnisse[oSpiel].paar2.shortlegs,
				ergebnisse[oSpiel].paar2.spieler2.highfinishes);
			console.log("DOPPEL", ergebnisse[oSpiel].paar2.spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar2.spieler2.name, score);
		}
	};	
};

function addScoreForPlayer(ergebnisse, sName, dScore) {
	for (var i = 0; i < ergebnisse.statistik.length; i++) {
		if (ergebnisse.statistik[i].name == sName) {
			ergebnisse.statistik[i].score += dScore;
			return;
		}
	};
	ergebnisse.statistik.push({
		"name" : sName,
		"score" : dScore
	});
};

function calcScoreForPlayer (cbSingle, clegs, c180er, cshortLegs, chighFinishes) {
	var iScore = 0;
	var iLegs = parseInt(clegs);
	var i180er = parseInt(c180er);
	var iShortlegs = parseInt(cshortLegs);
	var iHighFinishes = parseInt(chighFinishes);
	var dHfFactor = 0.3 / 69;

	if(cbSingle) {
		iScore += (iShortlegs != 0) ? (iShortlegs * -0.16 + 3.44) : 0;
											 // ein 9er Shortleg ergibt 2 Extra Punkte
											 // ein 19er noch 0.4 Extra Punkte.
											 // dazwischen errechnet sich der Wert linear über einen Faktor
	} else {
		iScore += (iShortlegs != 0) ? (iShortlegs * -0.16 + 3.44)*0.5 : 0; 
											 // ein 9er Shortleg ergibt 2 Extra Punkte
											 // ein 19er noch 0.4 Extra Punkte.
											 // dazwischen errechnet sich der Wert linear über einen Faktor
											 // und wird danach noch halbiert, da da im doppel gespielt wurde
	}
	iScore += iLegs;  // jedes leg gibt einen punkt
	iScore += (iLegs === 3) ? 2 : 0; // falls man das Spiel gewonnen hat gibt das nochmal zwei punkte extra
	iScore += (i180er != 0) ? (i180er * 0.9) : 0; // 180er zählen 0.9 Punkte
	iScore += (iHighFinishes != 0) ? (iHighFinishes * dHfFactor) : 0; 
										 // 170er High Finish gibt 0.8 Punkte und eine 101er HF noch 0.5 Punkte 
										 // dazwischen errechnet sich der Wert linear über einen Faktor
	return iScore;
};

function generateUID() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
};

function _getSliderValue() {
	var oVal = mySlider.getValue();
	var erg1 = 0;
	var erg2 = 0;
	switch (oVal) {
		case 0:
			erg1=3;
			erg2=0;
			break;
		case 1:
			erg1=3;
			erg2=1;
			break;
		case 2:
			erg1=3;
			erg2=2;
			break;
		case 3:
			erg1=2;
			erg2=3;
			break;
		case 4:
			erg1=1;
			erg2=3;
			break;
		case 5:
			erg1=0;
			erg2=3;
			break;
	}
	return {
		erg1 : erg1,
		erg2 : erg2
	}
};

/**
 * [checkSelection description]
 * @return {[type]}
 */
function checkSelection() {
	var bEinzel = (document.getElementById("spiel").value[0] === 'e');
	var oErgVals = _getSliderValue();
	if (!bEinzel) {
	  document.getElementById("speichern").disabled = !checkNames();
	}

	$("#ergDisplay").text(oErgVals.erg1 + ":" + oErgVals.erg2)
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

	document.getElementById("tcHeim").value = document.getElementById("emailHeim").value;
	document.getElementById("tcGast").value = document.getElementById("emailGast").value;

	$.get("styles/ergebnistabelle.css", function(oContent) {
	  document.getElementById("emailCSSStyles").value = oContent;
	});
	var aCookies = document.cookie.split(';')
	for (var i = aCookies.length - 1; i >= 0; i--) {
		if(aCookies[i] && aCookies[i] != "" && aCookies[i].indexOf("=") != -1) {
			var aCookie = aCookies[i].trim().split('=');
			if (aCookie[0].indexOf("email") === 0) {
				document.getElementById(aCookie[0].trim()).value = aCookie[1].trim();
			}
		}
	};
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

function emptyTable(sTableName) {
	$('#' + sTableName + ' > tbody').html("");
	$('#' + sTableName + ' > tbody').html("<tr></tr>");
};

function printTable(ergebnisse) {
	var lineCounter = 1;
	for (var erg in ergebnisse) {
	  if (ergebnisse[erg].spieler1 && ergebnisse[erg].spieler2) {
	    var classSpec = (lineCounter % 2 === 0) ? "einzelblockEven" : "einzelblockOdd";
	    var uid = generateUID();
	    var line = "<tr id='" + uid + "' class='"+classSpec+"' onclick='enableFormForSingles(true, " + lineCounter + ", \"" + uid + "\")'>"+
	                  "<td id='" + erg + "_spieler1_shortlegs' class='slhf180block'>" + p(ergebnisse[erg].spieler1.shortlegs) + "</td>\n"+
	                  "<td id='" + erg + "_spieler1_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].spieler1.highfinishes) + "</td>\n"+
	                  "<td id='" + erg + "_spieler1_i180er' class='slhf180block'>" + p(ergebnisse[erg].spieler1.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_spieler1_name'>" + ergebnisse[erg].spieler1.name + "</td>\n"+
	                  "<td class='ergebnisBlock'>"+
						"<font id='" + erg + "_spieler1_legs'>" + ergebnisse[erg].spieler1.legs + "</font>\n"+
						" : \n"+
						"<font id='" + erg + "_spieler2_legs'>" + ergebnisse[erg].spieler2.legs + "</font>\n"+
	                  "</td>\n"+
	                  "<td id='" + erg + "_spieler2_name'>" + ergebnisse[erg].spieler2.name + "</td>\n"+
	                  "<td id='" + erg + "_spieler2_i180er' class='slhf180block'>" + p(ergebnisse[erg].spieler2.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_spieler2_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].spieler2.highfinishes) + "</td>\n"+
	                  "<td id='" + erg + "_spieler2_shortlegs' class='slhf180block'>" + p(ergebnisse[erg].spieler2.shortlegs) + "</td>\n"+
	               "</tr>";
	    $('#summaryTable > tbody tr:last').after(line);
	    lineCounter++;
	  } else if (ergebnisse[erg].paar1 && ergebnisse[erg].paar2) {
	    var classSpec = (lineCounter % 2 === 0) ? "doppelblockEven" : "doppelblockOdd";
	    var uid = generateUID();

	    var line = "<tr id='" + uid + "_1' class='"+classSpec+"' onclick='enableFormForSingles(false, " + lineCounter + ", \"" + uid + "_1\")'>"+
	                  "<td id='" + erg + "_paar1_shortlegs' rowspan='2' class='slhf180block'>" + p(ergebnisse[erg].paar1.shortlegs) + "</td>\n"+
	                  "<td id='" + erg + "_paar1_spieler1_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler1.highfinishes) + "</td>\n"+
	                  "<td id='" + erg + "_paar1_spieler1_i180er' class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler1.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_paar1_spieler1_name'>" + ergebnisse[erg].paar1.spieler1.name + "</td>\n"+
	                  "<td rowspan='2' class='ergebnisBlock'>" +
						"<font id='" + erg + "_paar1_legs'>" + ergebnisse[erg].paar1.legs + "</font>\n"+
						" : \n"+
						"<font id='" + erg + "_paar2_legs'>" + ergebnisse[erg].paar2.legs + "</font>\n"+
	                  "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler1_name'>" + ergebnisse[erg].paar2.spieler1.name + "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler1_i180er' class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler1.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler1_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler1.highfinishes) + "</td>\n"+
	                  "<td id='" + erg + "_paar2_shortlegs' rowspan='2' class='slhf180block'>" + p(ergebnisse[erg].paar2.shortlegs) + "</td>\n"+
	                "</tr>\n"+
	                "<tr id='" + uid + "_2' class='"+classSpec+"' onclick='enableFormForSingles(false, " + lineCounter + ", \"" + uid + "_2\")'>\n"+
	                  "<td id='" + erg + "_paar1_spieler2_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler2.highfinishes) + "</td>\n"+
	                  "<td id='" + erg + "_paar1_spieler2_i180er' class='slhf180block'>" + p(ergebnisse[erg].paar1.spieler2.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_paar1_spieler2_name'>" + ergebnisse[erg].paar1.spieler2.name + "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler2_name'>" + ergebnisse[erg].paar2.spieler2.name + "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler2_i180er' class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler2.i180er) + "</td>\n"+
	                  "<td id='" + erg + "_paar2_spieler2_highfinishes' class='slhf180block'>" + p(ergebnisse[erg].paar2.spieler2.highfinishes) + "</td>\n"+
	                "</tr>";
	    $('#summaryTable > tbody tr:last').after(line);
	    lineCounter++;
	  }
	}
	var line = "<tr class='summaryBlock'>"+
	              "<td colspan=3 rowspan=2>&nbsp;</td>\n"+
	              "<td rowspan=2>Ergebnis:</td>\n"+
	              "<td nowrap>" +
					"<font id='team1Legs'>0</font>\n"+
					" : \n"+
					"<font id='team2Legs'>0</font>\n"+
                  "</td>\n"+
	              "<td> - Legs</td>\n"+
	              "<td colspan=3>&nbsp;</td>\n"+
	           "</tr>"+
	           "<tr class='summaryBlock'>"+
	              "<td nowrap>" +
					"<font id='team1Sets'>0</font>\n"+
					" : \n"+
					"<font id='team2Sets'>0</font>\n"+
                  "</td>\n"+
	              "<td> - Sets</td>\n"+
	              "<td colspan=3>&nbsp;</td>\n"+
	           "</tr>";
	$('#summaryTable > tbody tr:last').after(line);
	line = "<tr><td colspan=9><div class='bold'>Spielername (N) = Nachgemeldeter Spieler</div></td></tr>";
	$('#summaryTable > tbody tr:last').after(line);
};

function p(sErg) {
	return (sErg == 0) ? "&nbsp;" : sErg;
};

function internalStore() {
	var ergebnisse = JSON.parse(window.localStorage.getItem("ergebnisse"));

	var sSpiel = $("#spiel").val();
	var oErgVals = _getSliderValue();
	
	if (sSpiel.indexOf("e")==0) {
		var sName1 = unescape(atob(unescape($("#name1").val())));
		var sName2 = unescape(atob(unescape($("#name2").val())));
		ergebnisse[sSpiel].spieler1 = { 
			"name" : sName1, 
			"legs" : 					oErgVals.erg1, 
			"shortlegs" : 				$("#sl1").val() || 0, 
			"highfinishes" : 			$("#hf1").val() || 0, 
			"i180er" : 					$("#i180er1").val() || 0 
		};
		ergebnisse[sSpiel].spieler2 = { 
			"name" : sName2, 
			"legs" : 					oErgVals.erg2, 
			"shortlegs" : 				$("#sl2").val() || 0, 
			"highfinishes" : 			$("#hf2").val() || 0, 
			"i180er" : 					$("#i180er2").val() || 0 
		};

		document.getElementById(sSpiel + "_spieler1_name").innerHTML 				= p(ergebnisse[sSpiel].spieler1.name);
		document.getElementById(sSpiel + "_spieler1_legs").innerHTML 				= ergebnisse[sSpiel].spieler1.legs;
		document.getElementById(sSpiel + "_spieler1_shortlegs").innerHTML 			= p(ergebnisse[sSpiel].spieler1.shortlegs);
		document.getElementById(sSpiel + "_spieler1_highfinishes").innerHTML 		= p(ergebnisse[sSpiel].spieler1.highfinishes);
		document.getElementById(sSpiel + "_spieler1_i180er").innerHTML 				= p(ergebnisse[sSpiel].spieler1.i180er);

		document.getElementById(sSpiel + "_spieler2_name").innerHTML 				= p(ergebnisse[sSpiel].spieler2.name);
		document.getElementById(sSpiel + "_spieler2_legs").innerHTML 				= ergebnisse[sSpiel].spieler2.legs;
		document.getElementById(sSpiel + "_spieler2_shortlegs").innerHTML 			= p(ergebnisse[sSpiel].spieler2.shortlegs);
		document.getElementById(sSpiel + "_spieler2_highfinishes").innerHTML 		= p(ergebnisse[sSpiel].spieler2.highfinishes);
		document.getElementById(sSpiel + "_spieler2_i180er").innerHTML 				= p(ergebnisse[sSpiel].spieler2.i180er);

	} else {
		var sHeimName1 = unescape(atob(unescape($("#heimname1").val())));
		var sHeimName2 = unescape(atob(unescape($("#heimname2").val())));
		var sGastName1 = unescape(atob(unescape($("#gastname1").val())));
		var sGastName2 = unescape(atob(unescape($("#gastname2").val())));

		ergebnisse[sSpiel].paar1 = { 
			"legs" : 					oErgVals.erg1,
			"shortlegs" : 				$("#dsl1").val() || 0,
			"spieler1" : {
				"name" : sHeimName1, 
				"highfinishes" : 		$("#dhf1").val() || 0,
				"i180er" : 				$("#di180er1").val() || 0
			},
			"spieler2" : {
				"name" : sHeimName2, 
				"highfinishes" : 		$("#dhf2").val() || 0,
				"i180er" : 				$("#di180er2").val() || 0
			}
		};
		
		ergebnisse[sSpiel].paar2 = { 
			"legs" : 					oErgVals.erg2,
			"shortlegs" : 				$("#dsl2").val() || 0,
			"spieler1" : {
				"name" : sGastName1, 
				"highfinishes" : 		$("#dhf3").val() || 0,
				"i180er" : 				$("#di180er3").val() || 0
			},
			"spieler2" : {
				"name" : sGastName2, 
				"highfinishes" : 		$("#dhf4").val() || 0,
				"i180er" : 				$("#di180er4").val() || 0
			}
		};

		document.getElementById(sSpiel + "_paar1_legs").innerHTML 					= ergebnisse[sSpiel].paar1.legs;
		document.getElementById(sSpiel + "_paar1_shortlegs").innerHTML 				= p(ergebnisse[sSpiel].paar1.shortlegs);
		document.getElementById(sSpiel + "_paar1_spieler1_name").innerHTML 			= p(ergebnisse[sSpiel].paar1.spieler1.name);
		document.getElementById(sSpiel + "_paar1_spieler1_highfinishes").innerHTML 	= p(ergebnisse[sSpiel].paar1.spieler1.highfinishes);
		document.getElementById(sSpiel + "_paar1_spieler1_i180er").innerHTML		= p(ergebnisse[sSpiel].paar1.spieler1.i180er);
		document.getElementById(sSpiel + "_paar1_spieler2_name").innerHTML 			= p(ergebnisse[sSpiel].paar1.spieler2.name);
		document.getElementById(sSpiel + "_paar1_spieler2_highfinishes").innerHTML 	= p(ergebnisse[sSpiel].paar1.spieler2.highfinishes);
		document.getElementById(sSpiel + "_paar1_spieler2_i180er").innerHTML		= p(ergebnisse[sSpiel].paar1.spieler2.i180er);

		document.getElementById(sSpiel + "_paar2_legs").innerHTML 					= ergebnisse[sSpiel].paar2.legs;
		document.getElementById(sSpiel + "_paar2_shortlegs").innerHTML 				= p(ergebnisse[sSpiel].paar2.shortlegs);
		document.getElementById(sSpiel + "_paar2_spieler1_name").innerHTML 			= p(ergebnisse[sSpiel].paar2.spieler1.name);
		document.getElementById(sSpiel + "_paar2_spieler1_highfinishes").innerHTML 	= p(ergebnisse[sSpiel].paar2.spieler1.highfinishes);
		document.getElementById(sSpiel + "_paar2_spieler1_i180er").innerHTML		= p(ergebnisse[sSpiel].paar2.spieler1.i180er);
		document.getElementById(sSpiel + "_paar2_spieler2_name").innerHTML 			= p(ergebnisse[sSpiel].paar2.spieler2.name);
		document.getElementById(sSpiel + "_paar2_spieler2_highfinishes").innerHTML 	= p(ergebnisse[sSpiel].paar2.spieler2.highfinishes);
		document.getElementById(sSpiel + "_paar2_spieler2_i180er").innerHTML		= p(ergebnisse[sSpiel].paar2.spieler2.i180er);
	}

	var aSpiele = Object.keys(ergebnisse);
	var team1Legs = 0;
	var team2Legs = 0;
	var team1Sets = 0;
	var team2Sets = 0;
	
	for (var i = 0; i < aSpiele.length; i++) {
		var sSpiel = aSpiele[i];
		if (sSpiel.indexOf("e")==0) {
			team1Legs += parseInt(ergebnisse[sSpiel].spieler1.legs);
			team2Legs += parseInt(ergebnisse[sSpiel].spieler2.legs);
			if (ergebnisse[sSpiel].spieler1.legs>ergebnisse[sSpiel].spieler2.legs) {
				team1Sets++;
			} else if (ergebnisse[sSpiel].spieler1.legs<ergebnisse[sSpiel].spieler2.legs) {
				team2Sets++;
			}
		} else if (sSpiel.indexOf("d")==0) {
			team1Legs += parseInt(ergebnisse[sSpiel].paar1.legs);
			team2Legs += parseInt(ergebnisse[sSpiel].paar2.legs);
			if (ergebnisse[sSpiel].paar1.legs>ergebnisse[sSpiel].paar2.legs) {
				team1Sets++;
			} else if (ergebnisse[sSpiel].paar1.legs<ergebnisse[sSpiel].paar2.legs) {
				team2Sets++;
			}
		}
	};

	document.getElementById("team1Legs").innerHTML = team1Legs;
	document.getElementById("team2Legs").innerHTML = team2Legs;
	document.getElementById("team1Sets").innerHTML = team1Sets;
	document.getElementById("team2Sets").innerHTML = team2Sets;

	prepareStatistic(ergebnisse);
	updateStatistic(ergebnisse);
	window.localStorage.setItem("ergebnisse", JSON.stringify(ergebnisse));
	$("#playerForm")[0].reset();
	mySlider.setValue(0);
	$("#ergDisplay").text("3:0");
	$('#inputFormDialog').modal('hide');
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

	$('.selectpicker').selectpicker('render');

	$('#inputFormDialog').modal('show');
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
			oOptions.item(i).removeAttribute("style");
		}
		if (oOptions.item(i).disabled === true) {
			oOptions.item(i).disabled = false;
		}
	};

	for (var i = 0; i<oOptions.length; i++) {
		if (oStoredNames[oOptions.item(i).text]) {
			if(bSingle) {
				if (oOptions.item(i).text == ergebnisse[sSpiel].spieler1.name || oOptions.item(i).text == ergebnisse[sSpiel].spieler2.name) {
					oOptions.item(i).style.display = "inherit";
				} else {
					oOptions.item(i).style.display = "none";
					oOptions.item(i).disabled = true;
				}
			} else {
				if (oOptions.item(i).text == ergebnisse[sSpiel].paar1.spieler1.name 
					|| oOptions.item(i).text == ergebnisse[sSpiel].paar1.spieler2.name
					|| oOptions.item(i).text == ergebnisse[sSpiel].paar2.spieler1.name
					|| oOptions.item(i).text == ergebnisse[sSpiel].paar2.spieler2.name) {
					oOptions.item(i).style.display = "inherit";
				} else {
					oOptions.item(i).style.display = "none";
					oOptions.item(i).disabled = true;
				}
			}
		}
	};

	var mNames = {};
	if (bSingle) {
		mNames[ergebnisse[sSpiel].spieler1.name] = {};
		mNames[ergebnisse[sSpiel].spieler2.name] = {};
		delete mNames[""];
	} else {
		mNames[ergebnisse[sSpiel].paar1.spieler1.name] = {};
		mNames[ergebnisse[sSpiel].paar1.spieler2.name] = {};
		mNames[ergebnisse[sSpiel].paar2.spieler1.name] = {};
		mNames[ergebnisse[sSpiel].paar2.spieler2.name] = {};
		delete mNames[""];
	}


	if (Object.keys(mNames).length != 0) {
		// select the ones that played the match before
		for (var i = 0; i<oOptions.length; i++) {
			if (mNames[oOptions.item(i).text] && oOptions.item(i).style.display !== "none") {
				oOptions.item(i).selected = true;
				break;
			}
		};
	} else {
		// if noone was selected, select the next player in the line
		for (var i = 0; i<oOptions.length; i++) {
			if (oOptions.item(i).style.display !== "none") {
				oOptions.item(i).selected = true;
				break;
			}
		};
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

function showNachmeldungen() {
	bShowNachmeldungen = document.getElementById("nachmeldungenCheckbox").checked;  
	$("#nachmeldungenRowContent").appendTo((bShowNachmeldungen) ? "#nachmeldungenRow" : "#hiddenInputFieldContainer"); 
	document.getElementById("nachmeldungenRow").style.display = (bShowNachmeldungen) ? "block": "none" ;
};

function validateTextarea() {
	var inputarea = this;
	var errorTagId = inputarea.id.split("_")[1];  
	var pattern = new RegExp('^' + $(inputarea).attr('pattern') + '$');
	if (this.value === "" || this.value.match(pattern)) {
		jQuery("#"+inputarea.id).removeClass("nachmeldungenError");
		document.getElementById(errorTagId).style.display = "none";
	} else {
		jQuery("#"+inputarea.id).addClass("nachmeldungenError");
		document.getElementById(errorTagId).style.display = "block";
	}
};

function checkOnTeamSelection() {
	var heim = document.getElementById("teamheim");
	var gast = document.getElementById("teamgast");
	if (heim.selectedIndex != 0 && gast.selectedIndex != 0 && heim.selectedIndex != gast.selectedIndex) {
		document.getElementById("gameOnButton").disabled = false;
	} else {
		document.getElementById("gameOnButton").disabled = true;
	}
};

function escapeAll() {
	ergebnisseFromFile = JSON.parse(window.localStorage.getItem("ergebnisseLeer"));
	window.localStorage.setItem("ergebnisse", JSON.stringify(ergebnisseFromFile));
	ergebnisse = ergebnisseFromFile;

	var dCookieDate = new Date;
	dCookieDate.setFullYear(dCookieDate.getFullYear( ) + 1);
	document.cookie = 'emailHeim=' + document.getElementById("emailHeim").value + '; expires=' + dCookieDate.toGMTString( ) + ';';
	dCookieDate = new Date;
	dCookieDate.setHours(dCookieDate.getHours( ) + 24);
	document.cookie = 'emailGast=' + document.getElementById("emailGast").value + '; expires=' + dCookieDate.toGMTString( ) + ';';

	var heim = document.getElementById("teamheim").selectedOptions[0].value;
	var gast = document.getElementById("teamgast").selectedOptions[0].value;

	$("#nachmeldungenRowContent").appendTo("#hiddenInputFieldContainer");
	nachmeldungen = {
		heim : [],
		gast : []
	}
	nachmeldungen.heim.push(btoa(formatName(document.getElementById("nachmeldung_fh1").value.trim())));
	nachmeldungen.heim.push(btoa(formatName(document.getElementById("nachmeldung_fh2").value.trim())));
	nachmeldungen.heim.push(btoa(formatName(document.getElementById("nachmeldung_fh3").value.trim())));
	nachmeldungen.heim.push(btoa(formatName(document.getElementById("nachmeldung_fh4").value.trim())));
	nachmeldungen.gast.push(btoa(formatName(document.getElementById("nachmeldung_fg1").value.trim())));
	nachmeldungen.gast.push(btoa(formatName(document.getElementById("nachmeldung_fg2").value.trim())));
	nachmeldungen.gast.push(btoa(formatName(document.getElementById("nachmeldung_fg3").value.trim())));
	nachmeldungen.gast.push(btoa(formatName(document.getElementById("nachmeldung_fg4").value.trim())));
	window.localStorage.setItem("nachmeldungen", JSON.stringify(nachmeldungen));

	document.getElementById("heimFeldInTable").innerHTML = atob(heim);
	document.getElementById("gastFeldInTable").innerHTML = atob(gast);

	ergebnisse.heim = heim;
	ergebnisse.gast = gast;
	
	setUpSelections();

	window.localStorage.setItem("ergebnisse", JSON.stringify(ergebnisse));

	emptyTable("summaryTable");
	emptyTable("scoresTable");
	printTable(ergebnisseFromFile);

	$('#myTabs li:eq(1) a').tab('show');

};

function formatName(sName) {
	return (sName && sName!="") ? sName + " (N)" : "";
};

function displayBusyIndicator() {
	$("#busyindicator").css("visibility","visible"); 
};

function initializeGameSelectionScreen(oVereine) {

	var aVereine = [];
	for (var verein in oVereine) {
		aVereine.push(atob(verein));
	};
	//global Variable vereine is used averywhere else...
	vereine = oVereine;

	aVereine.sort();

	for (var i = 0; i<aVereine.length; i++) {
		$('#teamheim').append($("<option/>", {value: btoa(aVereine[i]),text: aVereine[i]}));
		$('#teamgast').append($("<option/>", {value: btoa(aVereine[i]),text: aVereine[i]}));
	};

	// Read out cookies for emails stored
	// bear in mind this works only in desktop systems
	var aCookies = document.cookie.split(';')
	for (var i = aCookies.length - 1; i >= 0; i--) {
		if(aCookies[i] && aCookies[i] != "" && aCookies[i].indexOf("=") != -1) {
			var aCookie = aCookies[i].trim().split('=');
			if (aCookie[0].indexOf("email") === 0) {
				document.getElementById(aCookie[0].trim()).value = aCookie[1].trim();
			}
		}
	};
	
};


/*!
* Main Program....
*/

var heim = unescape(window.localStorage.getItem("heim"));
var gast = unescape(window.localStorage.getItem("gast"));
var spiel = window.localStorage.getItem("spiel");
var nachmeldungen = JSON.parse(window.localStorage.getItem("nachmeldungen"));
var ergebnisse = undefined;
var vereine = null;

$.getJSON("data/ergebnisse.json", function(ergebnisseFromFile) {
	window.localStorage.setItem("ergebnisseLeer", JSON.stringify(ergebnisseFromFile));
});	

switchMore("more1", false, 0);
switchMore("more2", false, 0);
switchMore("dmore1", false, 0);
switchMore("dmore2", false, 0);
switchMore("dmore3", false, 0);
switchMore("dmore4", false, 0);

$('#nachmeldung_fh1').keyup(validateTextarea);
$('#nachmeldung_fh2').keyup(validateTextarea);
$('#nachmeldung_fh3').keyup(validateTextarea);
$('#nachmeldung_fh4').keyup(validateTextarea);
$('#nachmeldung_fg1').keyup(validateTextarea);
$('#nachmeldung_fg2').keyup(validateTextarea);
$('#nachmeldung_fg3').keyup(validateTextarea);
$('#nachmeldung_fg4').keyup(validateTextarea);

var mySlider = new Slider("#ergSlider", {
	id: "ergSliderId",
	min: 0,
	max: 5,
	value: 0,
	tooltip: 'hide'
});
mySlider.on('slide', checkSelection);

initializeGameSelectionScreen(

		{
	"MS5EQyBKb2tlcnMgSG9ja2VuaGVpbQ==": {
		"mitglieder": [
			{
				"name": "Rvx0dGVyZXI=",
				"vorname": "RGlyaw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "Rvx0dGVyZXI=",
				"vorname": "TWFya3Vz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SGFuc2t5",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SGF2ZW5zdGVpbg==",
				"vorname": "RGlyaw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SG9ja2Vy",
				"vorname": "UGF0cmljaw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SHViZXI=",
				"vorname": "TWFydGluIChUQyk=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U3RldHRlcg==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2VpbWFy",
				"vorname": "U3RlZmFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2VybmVy",
				"vorname": "UGF0cmljaw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"REMgUmVpdGVyc3T8YmxlIEVwcGluZ2VuIDI=": {
		"mitglieder": [
			{
				"name": "RmlzY2hlcg==",
				"vorname": "TWFyaW8=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R+RydG5lcg==",
				"vorname": "R2FiaQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "S/ZzdGVy",
				"vorname": "TmFkamE=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TGF1a2h1ZmY=",
				"vorname": "TWFudWVs",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TmllaGFnZQ==",
				"vorname": "TWlrZQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "UvZzaW5nZXI=",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2Nob2x6",
				"vorname": "RGlyayAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V29sZHQ=",
				"vorname": "RGlldGVy",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"REMgVW5kZXJ0YWtlciByZWxvYWRlZCAx": {
		"mitglieder": [
			{
				"name": "QWxiZXJ0",
				"vorname": "VmFuZXNzYQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "QWxicmVjaHQ=",
				"vorname": "Um9iZXJ0",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "Qm9zcw==",
				"vorname": "TWlrZQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RnJlaXNlaXM=",
				"vorname": "SGVpbno=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R3JldWxpY2g=",
				"vorname": "S29samE=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SGFnbWFubg==",
				"vorname": "S2lt",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "S25lYmVs",
				"vorname": "TWF0dGhpYXM=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TWVja2xlbmJ1cmc=",
				"vorname": "VXdlIChUQyk=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U3RlaW5lcg==",
				"vorname": "VGhvbWFz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"REMgVW5kZXJ0YWtlciByZWxvYWRlZCAy": {
		"mitglieder": [
			{
				"name": "Qm9zcw==",
				"vorname": "RG9taW5payAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RW1iYWNo",
				"vorname": "TWFydGlu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RnJlaXNlaXM=",
				"vorname": "RnJhbms=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RnVjaHM=",
				"vorname": "S2FybC1IZWlueg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "S29zdA==",
				"vorname": "UGF0cmljaw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "UmFwdGlz",
				"vorname": "Tmlrb2xhb3M=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U3RlbGxl",
				"vorname": "TWlrZQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "WmFuZw==",
				"vorname": "TG90aGFy",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"SXJvbiBFYWdsZXM=": {
		"mitglieder": [
			{
				"name": "TG9jaGJhdW0=",
				"vorname": "TGFycw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "THVjYXM=",
				"vorname": "SmFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TW9ocg==",
				"vorname": "TWFya3Vz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TW9ocg==",
				"vorname": "VG9iaWFzIChUQyk=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NodWx6ZW5kb3Jm",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2ViZXI=",
				"vorname": "Rmxvcmlhbg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "WnViZXI=",
				"vorname": "U3Zlbg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R2VyZG9u",
				"vorname": "TWFyY2Vs",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"R2VnZW4gZGllIERy/GNrIDM=": {
		"mitglieder": [
			{
				"name": "QW5zZWxtYW5u",
				"vorname": "VGlt",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RHVyY2hob2x6",
				"vorname": "QmFzdGlhbiAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R2F3bGlr",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SmFueQ==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NoaWVk",
				"vorname": "QW5kcmVhcw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2tyenlwZWs=",
				"vorname": "SXdhbmE=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2ViZXI=",
				"vorname": "SG9sZ2Vy",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"R2VnZW4gZGllIERy/GNrIDQ=": {
		"mitglieder": [
			{
				"name": "U3RhY2hl",
				"vorname": "TWFudWVsYQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R3Vtc2hlaW1lcg==",
				"vorname": "VGluYQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TWFjaw==",
				"vorname": "UmVuYXRl",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2ludGVy",
				"vorname": "QW5uYQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TWFyZ3JhZg==",
				"vorname": "U2FuZHJh",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TW9ja2Vy",
				"vorname": "WXZvbm5lIChUQyk=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RHdvcmFjemVr",
				"vorname": "QW5ldHRh",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"VGFyYXhhY3VtYSBEaWUgRHJpdHRl": {
		"mitglieder": [
			{
				"name": "SGFobg==",
				"vorname": "VGhvbWFz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SmFuaW4=",
				"vorname": "U2FicmluYQ==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SmV3ZWxs",
				"vorname": "RGF2aWQ=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "S/xibGVy",
				"vorname": "THVrYXM=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TW9ocg==",
				"vorname": "SvxyZ2Vu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2VpY2s=",
				"vorname": "QW5kcmVhcw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2VybmVy",
				"vorname": "QXJtaW4=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "V2VybmVy",
				"vorname": "SnV0dGE=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "WmllZ2U=",
				"vorname": "RGVubmlz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "UmljaGFyZA==",
				"vorname": "QW5kcmVhIChUQyk=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "SG9kb3JmZg==",
				"vorname": "VGFuamE=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"VGFyYXhhY3VtYSBUTlQ=": {
		"mitglieder": [
			{
				"name": "QmFydGg=",
				"vorname": "SG9sZ2Vy",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "R3Jv3w==",
				"vorname": "Q2hyaXN0aW5h",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "UmllZGxl",
				"vorname": "SGVpbno=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NobWlkdA==",
				"vorname": "Sm9jaGVu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NobWlkdA==",
				"vorname": "VG9iaWFz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NobWl0dGVja2VydA==",
				"vorname": "QmVybmQ=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NobWl0dGVja2VydA==",
				"vorname": "U2FzY2hh",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U3RlZ238bGxlcg==",
				"vorname": "UmFsZiAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U3RlaW5sZQ==",
				"vorname": "U3RlZmFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"VGVhbSBJZGVhbCBXaWxkIFRpZ2Vycw==": {
		"mitglieder": [
			{
				"name": "QmFjaGVydA==",
				"vorname": "U3RlZmZlbg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "QmF1c3Q=",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "QnJ1Y2tlcg==",
				"vorname": "SvxyZ2Vu",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "QnVuaW5n",
				"vorname": "U3RlcGhhbmll",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "VGhvbWE=",
				"vorname": "U3VzYW5uZSAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"VGVhbSBXaWxkZXIgTWFubg==": {
		"mitglieder": [
			{
				"name": "Qm9ndW1pbA==",
				"vorname": "SvZyZyAoVEMp",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "RGEgU2lsdmFub3Zv",
				"vorname": "QW50b25pbw==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TGFtb3Ro",
				"vorname": "VXdl",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TWVobG1lcg==",
				"vorname": "QmVybmQ=",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "TWljaGw=",
				"vorname": "Um9sZg==",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			},
			{
				"name": "U2NoZWxs",
				"vorname": "VGhvbWFz",
				"klasse": "S3JlaXNsaWdhIE5vcmQ="
			}
		]
	},
	"RGFydCBUcmFpbiBSYXN0YXR0": {
		"mitglieder": [
			{
				"name": "QnVya2FydA==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RnJpdHo=",
				"vorname": "SmVubnk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGFuZGtl",
				"vorname": "SmVucw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGF2ZWxrYQ==",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGVsbGdvdGg=",
				"vorname": "TWFydGlu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2lsZ291cg==",
				"vorname": "RGF2ZQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S272Ymw=",
				"vorname": "R2VyZA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGhpbGlwcA==",
				"vorname": "RGlldGVyIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UmVkd2Fueg==",
				"vorname": "S2xhdXM=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"REMgQmxhdS1XZWnfIEthcmxzcnVoZQ==": {
		"mitglieder": [
			{
				"name": "QmFybnN0ZWR0",
				"vorname": "V29sZnJhbQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Q29vZ2Fu",
				"vorname": "RmVyZ2hhbA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RGUgQm9ydG9saQ==",
				"vorname": "VWRv",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "R/Z0emVsbWFubg==",
				"vorname": "VG9iaWFzIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Sm9jaw==",
				"vorname": "QmVybnQ=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "T2hlaW0=",
				"vorname": "SG9yc3Q=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGFobGtl",
				"vorname": "U3RlZmFu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGV0dGljaA==",
				"vorname": "TWFya3Vz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGxvdGg=",
				"vorname": "U2ViYXN0aWFu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Qmllcm5hdHpraQ==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"RC5BLlIuVC4gUGx1bWJhdGE=": {
		"mitglieder": [
			{
				"name": "QW50YWw=",
				"vorname": "T2xpdmVyIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QWxwaW5v",
				"vorname": "RmFiaW8=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QXVnZW5zdGVpbg==",
				"vorname": "TWFyaXVz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QXVnZW5zdGVpbg==",
				"vorname": "Tm9yYmVydA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QmVybmluZ2Vy",
				"vorname": "SGFucw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QnJhdW4=",
				"vorname": "UmVuZQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SG9mbWFubg==",
				"vorname": "SmFu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SPZnZXI=",
				"vorname": "SvZyZw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Sm91ZGk=",
				"vorname": "Sm9zZWY=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2xlaW4=",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2xvbWFubg==",
				"vorname": "TWVsYW5pZQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S/ZuaWc=",
				"vorname": "S2V2aW4=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "TXVudHo=",
				"vorname": "SGFucyBQZXRlcg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Um9oZGU=",
				"vorname": "VGhvbWFz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "V2ViZXI=",
				"vorname": "QWxleGFuZGVy",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "TWFpZXI=",
				"vorname": "TWlyY2Vh",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"REMgU2hhbXJvY2s=": {
		"mitglieder": [
			{
				"name": "QmlzY2hvZmY=",
				"vorname": "QmVuamFtaW4gKFRDKQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RHVyaW5n",
				"vorname": "QW5kcmVhcw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RXNwaWc=",
				"vorname": "VG9uaQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SG9mZm1hbm4=",
				"vorname": "WWFzbWlu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2ltbGluZw==",
				"vorname": "SmVucw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S3Vobg==",
				"vorname": "QWxleGFuZGVy",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UHVqaWM=",
				"vorname": "TWF0dGhpYXM=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "U2NobGljaHQ=",
				"vorname": "V2VybmVy",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "U3RhbnNjaA==",
				"vorname": "VG9iaWFz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "V2FnbmVy",
				"vorname": "TWljaGE=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"R2FnZ2VuYXVlciBEYXJ0bW9za2l0b3MgMQ==": {
		"mitglieder": [
			{
				"name": "S29ocnQ=",
				"vorname": "Rmxvcmlhbg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S3J6eXphbm93c2tp",
				"vorname": "THVrYXM=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Tm93YWs=",
				"vorname": "THVrYXM=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Tm93YWs=",
				"vorname": "TWFydGlu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "U2Nob3JwcA==",
				"vorname": "Q2hyaXN0aWFuIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "U2NodWJlcnQ=",
				"vorname": "QmFzdGlhbg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "V2Fseg==",
				"vorname": "RGF2aWQ=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"R2FnZ2VuYXVlciBEYXJ0bW9za2l0b3MgMg==": {
		"mitglieder": [
			{
				"name": "V2Vpcw==",
				"vorname": "RnJhbms=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QmFjaGU=",
				"vorname": "Sm9obg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "R2xlaXNsZQ==",
				"vorname": "TWljaGFlbA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S3JhZnQ=",
				"vorname": "VGhvbWFz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGZs/Gdlcg==",
				"vorname": "Sm9hY2hpbSAoVEMp",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGx1dHRh",
				"vorname": "TWF0ZXVzeg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGx1dHRh",
				"vorname": "UnlzemFyZA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UmF1bQ==",
				"vorname": "RG9taW5paw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGVpZGVja2U=",
				"vorname": "U3RlZmZlbg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"S2FybHNydWhlciBEYXJ0LUZyZXVuZGU=": {
		"mitglieder": [
			{
				"name": "TWFnZXI=",
				"vorname": "RmFiaWFuIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UmVlYg==",
				"vorname": "TWFuZnJlZA==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UGlsZ3JpbQ==",
				"vorname": "SmVycnk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QmVpZXI=",
				"vorname": "Tm9yYQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGVudHNjaGVsIEhvZmZtYW5u",
				"vorname": "SG9sZ2Vy",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"REMgODEgS2FybHNydWhl": {
		"mitglieder": [
			{
				"name": "TfxsbGVy",
				"vorname": "TWFyY28gKFRDKQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QW5kZXJ0",
				"vorname": "SXJpcw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QXJhY2k=",
				"vorname": "Q2loYW4=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RGF1bQ==",
				"vorname": "SvxyZ2Vu",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "R2VnZW5oZWltZXI=",
				"vorname": "TWF0dGhpYXM=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "R/ZiZWw=",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SWxjaG1hbm4=",
				"vorname": "SG9yc3Q=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "TfxsbGVy",
				"vorname": "Qm9kbw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "TmV1aGF1cw==",
				"vorname": "TWFyaW8=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"VGFyYXhhY3VtYSBUb3JuYWRvcw==": {
		"mitglieder": [
			{
				"name": "QmlsbG1hbm4=",
				"vorname": "VGhvcnN0ZW4=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Q29jaG9u",
				"vorname": "Sm9zZQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SGVja2Vy",
				"vorname": "SvZyZw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "SHVyc3Q=",
				"vorname": "TWlrZQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "T2JlcmFja2Vy",
				"vorname": "Um9ubnk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "UmljaGFyZA==",
				"vorname": "RGlldGVyIChUQyk=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "U2NoZXJlcg==",
				"vorname": "QW5kcmU=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "Vm9nbGVy",
				"vorname": "TWFya3Vz",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"VGFyYXhhY3VtYSBX9mxmZQ==": {
		"mitglieder": [
			{
				"name": "QmVja2Vy",
				"vorname": "U3RlZmZlbg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "RGFtc29ucw==",
				"vorname": "RGlhbmEgKFRDKQ==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "R3V0dGluZw==",
				"vorname": "UmFsZg==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2FydGFjaA==",
				"vorname": "SvZyZw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "S2VpbGhhdWVy",
				"vorname": "QXJtaW4=",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			},
			{
				"name": "QmVja2Vy",
				"vorname": "Q2hyaXN0aW5l",
				"klasse": ""
			},
			{
				"name": "S25vYmxvY2g=",
				"vorname": "QW5kcmVhcw==",
				"klasse": "S3JlaXNsaWdhIFP8ZA=="
			}
		]
	},
	"QWxsYSBI5GVlZWVociBQZm9yemhlaW0=": {
		"mitglieder": [
			{
				"name": "SPZsemxl",
				"vorname": "S2Fp",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SPZsemxl",
				"vorname": "TWFpaw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SG9wcGU=",
				"vorname": "SGFyYWxk",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S29yYm1hbm4=",
				"vorname": "Um9iaW4=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S3VuemU=",
				"vorname": "U2ViYXN0aWFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2F1ZXI=",
				"vorname": "TGVv",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2NobWlkdA==",
				"vorname": "QWxleGFuZGVyIChUQyk=",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"QkRDIEJyZWFrZXJz": {
		"mitglieder": [
			{
				"name": "U2F1dGVy",
				"vorname": "QXhlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "THV0eg==",
				"vorname": "SGFyYWxk",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TfxsbGVy",
				"vorname": "T2xpdmVy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TWVyZ2Vs",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "VHJldHRlcg==",
				"vorname": "TWFya3Vz",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U3RpZXNz",
				"vorname": "U3RlZmZlbiAoVEMp",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"RGFydHNwdWIgV2FsbGRvcmYgMw==": {
		"mitglieder": [
			{
				"name": "QmVja2Vy",
				"vorname": "SmVucy1EaWV0ZXI=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "QmVzcnV0c2No",
				"vorname": "UmFpbmVy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Qm9wcA==",
				"vorname": "Rmxvcmlhbg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SG9mZm1hbm4=",
				"vorname": "RGlyayAoVEMp",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SPx0aGVy",
				"vorname": "U3RlZmFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2llc2VyLVJvdA==",
				"vorname": "Uml0YQ==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TWFzY2hlaw==",
				"vorname": "VXdl",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U3RvbHpl",
				"vorname": "UmFsZg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "WmltbWVybWFubg==",
				"vorname": "SvxyZ2Vu",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgQmxhY2sgS25pZ2h0cyBI9nJkdCAy": {
		"mitglieder": [
			{
				"name": "RmlzY2hlcg==",
				"vorname": "VGhvcnN0ZW4=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2FzaWtjaQ==",
				"vorname": "U2Vub2w=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2llc2Vy",
				"vorname": "UGFzY2Fs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S29jaGVuZPZyZmVy",
				"vorname": "QW5kcmVhcw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S29jaGVuZPZyZmVy",
				"vorname": "Q2hyaXN0aWFuIChUQyk=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TXVobA==",
				"vorname": "SmVucw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TXV0aWM=",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2NoYW56",
				"vorname": "QWxiZXJ0",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "V2V0emVs",
				"vorname": "VXdl",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "UGhpbGxpcA==",
				"vorname": "R3JlZ29y",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgRmxhdGxpbmVycyBLYXJsc3J1aGUgMg==": {
		"mitglieder": [
			{
				"name": "QW5zZWw=",
				"vorname": "SvxyZ2Vu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGVjaw==",
				"vorname": "RGFuaWVs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SWhsaQ==",
				"vorname": "Tmljbw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2FtbWVybGFuZGVy",
				"vorname": "VG9iaWFz",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2FyYWNhbg==",
				"vorname": "QmFyaXM=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2lyY2hlbmJhdWVy",
				"vorname": "Vm9sa2Vy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S292YWM=",
				"vorname": "RHVqa28=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S3JhdXNz",
				"vorname": "UGV0ZXIgKFRDKQ==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S3L8Z2Vy",
				"vorname": "RmVsaXg=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TW9vZw==",
				"vorname": "SXZlcw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "UG9zdGxlcg==",
				"vorname": "S2V2aW4=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "V2Vpc3M=",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Tvxzc2xl",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2No5HR6bGU=",
				"vorname": "TWlya28=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2No5HR6bGU=",
				"vorname": "VGltbw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgTGV0c2NoZWJhY2g=": {
		"mitglieder": [
			{
				"name": "QnL2bXNlcg==",
				"vorname": "VXdl",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R2ViaGFyZA==",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGFhY2s=",
				"vorname": "R/xudGhlcg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGFsbGVy",
				"vorname": "TWFudWVs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGVjaw==",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S3VuemVuYmFjaGVy",
				"vorname": "Q2xhdXM=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TG9vY2s=",
				"vorname": "UmljaGFyZA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TWVpZXI=",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "1npjYW4=",
				"vorname": "U2VydmV0",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Um9h",
				"vorname": "TWFya3Vz",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgUmVpdGVyc3T8YmxlIEVwcGluZ2VuIDE=": {
		"mitglieder": [
			{
				"name": "QWxsZ2VpZXI=",
				"vorname": "UGhpbGlwcA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R+RydG5lcg==",
				"vorname": "TWFyY2Vs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2FsdGVubWVpZXI=",
				"vorname": "U2llZ2ZyaWVk",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2NoZXloaW5n",
				"vorname": "T2xpdmVy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "VW50ZXJodWJlcg==",
				"vorname": "S2V2aW4=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "V2FiYmVs",
				"vorname": "VGhvbWFz",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgU3R1ZGVudGVuIEJlbGxoZWlt": {
		"mitglieder": [
			{
				"name": "QWxleGFuZGVy",
				"vorname": "UGF0cmljayAoVEMp",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R3JlaWY=",
				"vorname": "WWFubmlr",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TfxsbGVy",
				"vorname": "TWFya3Vz",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TmllZGVyZXI=",
				"vorname": "Sm9jaGVu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2NobWlkdA==",
				"vorname": "SGFydG11dA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TGVpc2luZ2Vy",
				"vorname": "QmVuZWRpa3Q=",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"RnJleWdlcmJlciBGaWdodGVycw==": {
		"mitglieder": [
			{
				"name": "QnVzY2g=",
				"vorname": "THVjYXM=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R2FhYg==",
				"vorname": "U2FzY2hh",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R3JvbGw=",
				"vorname": "TWFya3Vz",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SuRocmxpbmc=",
				"vorname": "SGFucw==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TWFzdGFmYW9uaQ==",
				"vorname": "QmFzdGlhbg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "TWFzdGFmYW9uaQ==",
				"vorname": "S2FyaW0=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "UmVubmVy",
				"vorname": "TWFya3Vz",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "U2NobGVwcGk=",
				"vorname": "S2xhdXM=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "VGhpZXM=",
				"vorname": "QmFzdGkgKFRDKQ==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "VGhpZXM=",
				"vorname": "U3RlZmFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "QmFyb24=",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"TGFPbGEgV2VpbmhlaW0=": {
		"mitglieder": [
			{
				"name": "SG93ZQ==",
				"vorname": "U2ltb25lIChUQyk=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "QmF1bQ==",
				"vorname": "QW5uaWth",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "RGVtaXJlbA==",
				"vorname": "QWxp",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGF1Y2s=",
				"vorname": "UmFpbmVy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SHVuZHNoYW1tZXI=",
				"vorname": "RnJhbms=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S3JpZWdlcg==",
				"vorname": "U3RlZmFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "UmF1c2NoZXI=",
				"vorname": "TWljaGFlbA==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "V2FsdGhlcg==",
				"vorname": "RGFuaWVs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SORtZXI=",
				"vorname": "T2xpdmVy",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "V2FsdGhlcg==",
				"vorname": "U3Zlbg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"REMgVW5kZXJncm91bmQgRm9vbGBz": {
		"mitglieder": [
			{
				"name": "RnJ1aG5lcg==",
				"vorname": "SGVpa28gKFRDKQ==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "QmVzZXNlaw==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Q2FudGFubmE=",
				"vorname": "R3Vpc2VwcGU=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "RmllZGxlcg==",
				"vorname": "U3Zlbg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "R290dG1hbm4=",
				"vorname": "S2F5",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "SGVyeg==",
				"vorname": "Vml0YWxp",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "S2FtbWVyZXI=",
				"vorname": "TWlndWVs",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Um90aA==",
				"vorname": "VXJiYW4=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "RPxycg==",
				"vorname": "VGFyZWs=",
				"klasse": "QmV6aXJrc2xpZ2E="
			},
			{
				"name": "Vm9nZ2VucmVpdGVy",
				"vorname": "UmFsZg==",
				"klasse": "QmV6aXJrc2xpZ2E="
			}
		]
	},
	"RGFydHNwdWIgV2FsbGRvcmYgMg==": {
		"mitglieder": [
			{
				"name": "QXlsbG9u",
				"vorname": "Sm9obg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "Qm9ubg==",
				"vorname": "RG9taW5paw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "QnVi",
				"vorname": "TGVpZi1Fcmlj",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "Q2Fyb2xp",
				"vorname": "TWF0dGhpYXM=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "RWxicw==",
				"vorname": "QmVuamFtaW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "R3Jv32UtU3RvbHRlbmJlcmc=",
				"vorname": "TWlrYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SuRnZXI=",
				"vorname": "SmFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S2F0aWM=",
				"vorname": "Tmlrb2xh",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S3JhZnQ=",
				"vorname": "Q2xhdWRpYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S/ZobGVy",
				"vorname": "U2FiaW5lIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TW9o",
				"vorname": "QmVuamFtaW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "UGZhZmY=",
				"vorname": "SGFucw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3D2cmxl",
				"vorname": "U2FicmluYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3Rhbmds",
				"vorname": "VGhvbWFz",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3RlaW4=",
				"vorname": "U2FzY2hh",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2VmZXJz",
				"vorname": "VGhvcnN0ZW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2VybGU=",
				"vorname": "U2ViYXN0aWFu",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"REMgQmxhY2sgS25pZ2h0cyBI9nJkdCAx": {
		"mitglieder": [
			{
				"name": "S2xlaW4=",
				"vorname": "TWFyY28=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S3J6eXphbm93c2tp",
				"vorname": "U3Zlbg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWFnaW4=",
				"vorname": "U2FzY2hhIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWF0aGlz",
				"vorname": "RGVsYmVydA==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWVpc2Vs",
				"vorname": "QW5keQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "UGZpcnJtYW5u",
				"vorname": "QW5kcmU=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V29sZmY=",
				"vorname": "TWFyY3Vz",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"REMgRmxhdGxpbmVycyBLYXJsc3J1aGUgMQ==": {
		"mitglieder": [
			{
				"name": "QmF1bWFubg==",
				"vorname": "Sm9obg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SG9mZm1hbm4=",
				"vorname": "TWFya3Vz",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SG9mZm1hbm4=",
				"vorname": "TWlrYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S2VsbG5lcg==",
				"vorname": "TWFya3VzIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S/ZobmxlaW4=",
				"vorname": "VGhvbWFz",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TG95",
				"vorname": "TWFyY2Vs",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWV5ZXI=",
				"vorname": "VG9yc3Rlbg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TXXfZ251Zw==",
				"vorname": "VGhvcnN0ZW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TmVlcw==",
				"vorname": "VGhvbWFz",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "Um9sbGVy",
				"vorname": "RnJlZGR5",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U2Nob2Jlcg==",
				"vorname": "VGltbw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3BhdGhlbGY=",
				"vorname": "U3RlZmFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3T8YnM=",
				"vorname": "TWljaGFlbA==",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"R2VnZW4gZGllIERy/GNrIDE=": {
		"mitglieder": [
			{
				"name": "QvxyZ2Vy",
				"vorname": "WmFmZXI=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "RmFja2VsbWFubg==",
				"vorname": "RnJhbms=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "R3VuZA==",
				"vorname": "VGhvbWFz",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SOR1c2xlcg==",
				"vorname": "TWljaGFlbCAoVEMp",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "T2JlcmFja2Vy",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "T3Jsb3dza2k=",
				"vorname": "UmFsZg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2FsdGhlcg==",
				"vorname": "S2F5",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"R2VnZW4gZGllIERy/GNrIDI=": {
		"mitglieder": [
			{
				"name": "S2xvaA==",
				"vorname": "UGF0cmljaw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWFjaw==",
				"vorname": "UGF1bA==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWFyZ3JhZg==",
				"vorname": "TWF0dGhpYXMgKFRDKQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TXVobg==",
				"vorname": "QW5kcmU=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TXV0aA==",
				"vorname": "UvxkaWdlcg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "VHJlaWJlcg==",
				"vorname": "SmFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2l0dG1hbm4=",
				"vorname": "U3RlZmZlbg==",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"VGFyYXhhY3VtYSBCdWxscw==": {
		"mitglieder": [
			{
				"name": "QmVja2Vy",
				"vorname": "RGFuaWVsYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "QmVja2Vy",
				"vorname": "Sm9jaGVu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "R290dHdhbGQ=",
				"vorname": "TWFudWVsYQ==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S25lY2h0",
				"vorname": "RGlyaw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U2Nod2VpemVy",
				"vorname": "SvxyZ2Vu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3RlZmZlbg==",
				"vorname": "Q2FydHNlbg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2FlbGRpbg==",
				"vorname": "QW5kcmVhcw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2FlbGRpbg==",
				"vorname": "U3RlcGhhbmll",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2llZ2VyaW5n",
				"vorname": "U3RlZmFuIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"VGFyYXhhY3VtYSBFYWdsZXM=": {
		"mitglieder": [
			{
				"name": "RWJuZXI=",
				"vorname": "TWljaGFlbA==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SG90ZWw=",
				"vorname": "Sm9oYW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TGluaw==",
				"vorname": "U3RlZmFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TWF1bA==",
				"vorname": "TWljaGFlbA==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U2VpYmVydA==",
				"vorname": "VG9iaWFzIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3BlY2h0",
				"vorname": "QW5kcmVhcw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2lydGg=",
				"vorname": "QWxleGFuZGVy",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2l0dG1hbm4=",
				"vorname": "QmVydGhvbGQ=",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"VGFyYXhhY3VtYSBMaW9ucw==": {
		"mitglieder": [
			{
				"name": "QmVybmhhcmR0",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "RnJlaQ==",
				"vorname": "QW5kcmVhcw==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SG9mZm1hbm4=",
				"vorname": "RGFuaWVsIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SmFu32Vu",
				"vorname": "SG9sZ2Vy",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "S2FtbWVyZXI=",
				"vorname": "S2F5",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TPx0dGpvaGFubg==",
				"vorname": "U3RlcGhhbg==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U3Rlcnppbmc=",
				"vorname": "RnJhbms=",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	},
	"REMgRWwgRGlhYm9sbw==": {
		"mitglieder": [
			{
				"name": "U2NoYWFm",
				"vorname": "U2ViYXN0aWFuIChUQyk=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "R3JlYmVydA==",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "SGF1ZW5zdGVpbg==",
				"vorname": "TWljaGFlbA==",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TGFnYXRpZQ==",
				"vorname": "TWFyY2Vs",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "TfxsbGVy",
				"vorname": "THVrYXM=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "UmVlYg==",
				"vorname": "Um9tYW4=",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U2NoYWRl",
				"vorname": "Q2hyaXN0aWFu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "U/xsemxl",
				"vorname": "SvxyZ2Vu",
				"klasse": "T2JlcmxpZ2E="
			},
			{
				"name": "V2Vpbm1hbm4=",
				"vorname": "UGF0cmljaw==",
				"klasse": "T2JlcmxpZ2E="
			}
		]
	}
}
	  
);