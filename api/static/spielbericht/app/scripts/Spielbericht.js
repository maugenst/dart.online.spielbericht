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
}

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
		aSpielerHeim.push(vereine[ergebnisse.heim].mitglieder[i].name + ", " + vereine[ergebnisse.heim].mitglieder[i].vorname);
	}
	aSpielerHeim.sort();
	$('#name1').empty();
	$('#heimname1').empty();
	$('#heimname2').empty();

	for (var i = 0; i<aSpielerHeim.length; i++) {
		var spieler = aSpielerHeim[i];
		$('#name1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#heimname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#heimname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
	}

	for (var i = 0; i<nachmeldungen.heim.length; i++) {
		var spieler = unescape(atob(nachmeldungen.heim[i]));
		if (spieler != "") {
			$('#name1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#heimname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#heimname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		}
	};

	for (var i = 0; i<vereine[ergebnisse.gast].mitglieder.length; i++) {
		aSpielerGast.push(vereine[ergebnisse.gast].mitglieder[i].name + ", " + vereine[ergebnisse.gast].mitglieder[i].vorname);
	}
	aSpielerGast.sort();
	$('#name2').empty();
	$('#gastname1').empty();
	$('#gastname2').empty();

	for (var i = 0; i<aSpielerGast.length; i++) {
		var spieler = aSpielerGast[i];
		$('#name2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#gastname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
		$('#gastname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
	}

	for (var i = 0; i<nachmeldungen.gast.length; i++) {
		var spieler = unescape(atob(nachmeldungen.gast[i]));
		if (spieler != "") {
			$('#name2').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#gastname1').append($("<option/>", {value: btoa(spieler), text: spieler}));
			$('#gastname2').append($("<option/>", {value: btoa(spieler), text: spieler}));
		}
	}
	$('.selectpicker').selectpicker('refresh');
}

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
	}
}

function findHighestScore(scores) {
	var iHighestScore = 0;
	for (var i = scores.length - 1; i >= 0; i--) {
		if (scores[i].score > iHighestScore) {
			iHighestScore = scores[i].score;
		}
	}
	return iHighestScore;
}

function calculateWidth(highestScore, currentScore) {
	return currentScore * 100 / highestScore;
}

function prepareStatistic(ergebnisse) {
	ergebnisse['statistik'] = [];
    ergebnisse['playerStats'] = {};

	var aSpiele = Object.keys(ergebnisse);
	for (var i = 0; i < aSpiele.length; i++) {
		var oSpiel = aSpiele[i];
		if (ergebnisse[oSpiel].spieler1 && ergebnisse[oSpiel].spieler1.name!="" && ergebnisse[oSpiel].spieler2.name!="") {
			// Einzel
            var oGameResult = {
                team:           ergebnisse.heim,
                cOwnLegs:       ergebnisse[oSpiel].spieler1.legs,
                cOpponentLegs:  ergebnisse[oSpiel].spieler2.legs,
                c180er:         ergebnisse[oSpiel].spieler1.i180er,
                cshortLegs:     ergebnisse[oSpiel].spieler1.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].spieler1.highfinishes
            }
			var score = calcScoreForPlayer(oGameResult);
			console.log("EINZEL", ergebnisse[oSpiel].spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].spieler1.name, score, oGameResult);
            var oGameResult = {
                team:           ergebnisse.gast,
                cOwnLegs:       ergebnisse[oSpiel].spieler2.legs,
                cOpponentLegs:  ergebnisse[oSpiel].spieler1.legs,
                c180er:         ergebnisse[oSpiel].spieler2.i180er,
                cshortLegs:     ergebnisse[oSpiel].spieler2.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].spieler2.highfinishes
            }

			var score = calcScoreForPlayer(oGameResult);
			console.log("EINZEL", ergebnisse[oSpiel].spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].spieler2.name, score, oGameResult);
		}
		if (ergebnisse[oSpiel].paar1 && ergebnisse[oSpiel].paar1.spieler1.name!="" && ergebnisse[oSpiel].paar1.spieler2.name!="") {
			// Doppel 1
            var oGameResult = {
                team:           ergebnisse.heim,
                cOwnLegs:       ergebnisse[oSpiel].paar1.legs,
                cOpponentLegs:  ergebnisse[oSpiel].paar2.legs,
                c180er:         ergebnisse[oSpiel].paar1.spieler1.i180er,
                cshortLegs:     ergebnisse[oSpiel].paar1.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].paar1.spieler1.highfinishes
            };

            var score = calcScoreForPlayer(oGameResult);
			console.log("DOPPEL", ergebnisse[oSpiel].paar1.spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar1.spieler1.name, score, oGameResult);
            var oGameResult = {
                team:           ergebnisse.heim,
                cOwnLegs:       ergebnisse[oSpiel].paar1.legs,
                cOpponentLegs:  ergebnisse[oSpiel].paar2.legs,
                c180er:         ergebnisse[oSpiel].paar1.spieler2.i180er,
                cshortLegs:     ergebnisse[oSpiel].paar1.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].paar1.spieler2.highfinishes
            };
			var score = calcScoreForPlayer(oGameResult);
			console.log("DOPPEL", ergebnisse[oSpiel].paar1.spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar1.spieler2.name, score, oGameResult);
		}
		if (ergebnisse[oSpiel].paar2 && ergebnisse[oSpiel].paar2.spieler1.name!="" && ergebnisse[oSpiel].paar2.spieler2.name!="") {
			// Doppel 2
            var oGameResult = {
                team:           ergebnisse.gast,
                cOwnLegs:       ergebnisse[oSpiel].paar2.legs,
                cOpponentLegs:  ergebnisse[oSpiel].paar1.legs,
                c180er:         ergebnisse[oSpiel].paar2.spieler1.i180er,
                cshortLegs:     ergebnisse[oSpiel].paar2.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].paar2.spieler1.highfinishes
            };
			var score = calcScoreForPlayer(oGameResult);
			console.log("DOPPEL", ergebnisse[oSpiel].paar2.spieler1.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar2.spieler1.name, score, oGameResult);
            var oGameResult = {
                team:           ergebnisse.gast,
                cOwnLegs:       ergebnisse[oSpiel].paar2.legs,
                cOpponentLegs:  ergebnisse[oSpiel].paar1.legs,
                c180er:         ergebnisse[oSpiel].paar2.spieler2.i180er,
                cshortLegs:     ergebnisse[oSpiel].paar2.shortlegs,
                chighFinishes:  ergebnisse[oSpiel].paar2.spieler2.highfinishes
            };
			var score = calcScoreForPlayer(oGameResult);
			console.log("DOPPEL", ergebnisse[oSpiel].paar2.spieler2.name, score);
			addScoreForPlayer(ergebnisse, ergebnisse[oSpiel].paar2.spieler2.name, score, oGameResult);
		}
	}
}

function addScoreForPlayer(ergebnisse, sName, dScore, oDetails) {
    if (!ergebnisse.playerStats[sName]) {
        ergebnisse.playerStats[sName] = {
            '3:0' : 0,
            '3:1' : 0,
            '3:2' : 0,
            '2:3' : 0,
            '1:3' : 0,
            '0:3' : 0,
            hf : 0,
            sl : 0,
            max: 0,
            team: oDetails.team
        };
    }
    ergebnisse.playerStats[sName][oDetails.cOwnLegs + ':' + oDetails.cOpponentLegs]++;
    ergebnisse.playerStats[sName].hf += calcSpecials(oDetails.chighFinishes);
    ergebnisse.playerStats[sName].sl += calcSpecials(oDetails.cshortLegs);
    ergebnisse.playerStats[sName].max += calcSpecials(oDetails.c180er);

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

function gameValue (cOwnLegs, cOpponentLegs) {
    var sResult = cOwnLegs + ":" + cOpponentLegs;
    var iScore = 0;
    switch (sResult) {
        case "3:0" : iScore += 5; break;
        case "3:1" : iScore += 4; break;
        case "3:2" : iScore += 3; break;
        case "2:3" : iScore += 2; break;
        case "1:3" : iScore += 1; break;
        case "0:3" : iScore += 0; break;
        default: break;
    }
    return iScore;
};

function calcSpecials(cValue) {
    var aRet = [];
    if (cValue !== 0) {
        var sRepl = ""+cValue;
        sRepl = sRepl.replace(/\D/g, "_");
        sRepl = sRepl.replace(/__+/g, "_");
        aRet = sRepl.split('_');
    }
    return aRet.length;
};

function calcScoreForPlayer (oGameResult) {
    var cOwnLegs = oGameResult.cOwnLegs;
    var cOpponentLegs = oGameResult.cOpponentLegs;
    var c180er = oGameResult.c180er;
    var cshortLegs = oGameResult.cshortLegs;
    var chighFinishes = oGameResult.chighFinishes;
	var iScore = 0;
    var iOwnLegs = parseInt(cOwnLegs);
    var iOpponentLegs = parseInt(cOpponentLegs);
    var i180er = parseInt(c180er);

    iScore += gameValue(cOwnLegs, cOpponentLegs);

    iScore += calcSpecials(c180er);
    iScore += calcSpecials(cshortLegs);
    iScore += calcSpecials(chighFinishes);

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
	};
}

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
}

function checkNames() {
	var sHeimName1 = document.getElementById("heimname1").value;
	var sHeimName2 = document.getElementById("heimname2").value;
	var sGastName1 = document.getElementById("gastname1").value;
	var sGastName2 = document.getElementById("gastname2").value;

	return (sHeimName1 !== sHeimName2 && sGastName1 !== sGastName2);
}

function walkDOM(node, func) {
	func(node);
	node = node.firstChild;
	while(node) {
	  walkDOM(node,func);
	  node = node.nextSibling;
	}
}

function fillHiddenFieldsAndSubmit() {
	removeBorders();

    var oTest = JSON.parse(window.localStorage.getItem("ergebnisRAW"));

    oTest.heim = ergebnisse.heim;
    oTest.gast = ergebnisse.gast;

	document.getElementById("ergebnisRAW").value = JSON.stringify(oTest);

	document.getElementById("tcHeim").value = document.getElementById("emailHeim").value;
	document.getElementById("tcGast").value = document.getElementById("emailGast").value;

	$.get("styles/ergebnistabelle.css", function(oContent) {
	  document.getElementById("emailCSSStyles").value = oContent;
	});
	var aCookies = document.cookie.split(';')
	for (var i = aCookies.length - 1; i >= 0; i--) {
		if(aCookies[i] && aCookies[i] !== "" && aCookies[i].indexOf("=") !== -1) {
			var aCookie = aCookies[i].trim().split('=');
			if (aCookie[0].indexOf("email") === 0) {
				document.getElementById(aCookie[0].trim()).value = aCookie[1].trim();
			}
		}
	}

    displayBusyIndicator();

    document.getElementById("sendMail").submit();
}

function getUrlParameter(sParam){
  var sReturn = "";
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        sReturn = sParameterName[1];
      }
  }
  return sReturn;
}

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
}

function p(sErg) {
	return (sErg == 0) ? "&nbsp;" : sErg;
}

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

    var ergRAW = ergebnisse;
    
    ergRAW['summary'] = {
        heim: {
            legs: team1Legs,
            sets: team1Sets
        },
        gast: {
            legs: team2Legs,
            sets: team2Sets
        }
    }

    document.getElementById("ergebnisRAW").innerHTML = JSON.stringify(ergRAW, null, 4);
	window.localStorage.setItem("ergebnisRAW", JSON.stringify(ergRAW));
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

function getTeamId(encTeam) {
    for (var teamId in oTeams) {
        if (encTeam === oTeams[teamId].encTeam) {
            return teamId;
        }
    }
}

function checkOnTeamSelection() {
    //document.getElementById("teamgast").disabled = false;
	var heim = document.getElementById("teamheim");
	var gast = document.getElementById("teamgast");
    var heimTeamId = (heim.selectedIndex) ? heim.selectedOptions[0].value : undefined;
    var gastTeamId = (gast.selectedIndex) ? gast.selectedOptions[0].value : undefined;

    var oVereine = {};

    var sSpielID = "";

    for(var liga in oSpielplan) {
        for(var spieltag in oSpielplan[liga].vr) {
            for (var i in oSpielplan[liga].vr[spieltag]) {
                var spiel = oSpielplan[liga].vr[spieltag][i];
                if (spiel.heim && spiel.heim === heimTeamId) {
                    oVereine[spiel.gast] = {
                        teamId: spiel.gast,
                        name: oTeams[spiel.gast].name
                    };
                    if (spiel.gast && spiel.gast == gastTeamId) {
                        sSpielID = spiel.id;
                    }
                }
            }
        }
        for(var spieltag in oSpielplan[liga].rr) {
            for (var i in oSpielplan[liga].rr[spieltag]) {
                var spiel = oSpielplan[liga].rr[spieltag][i];
                if (spiel.heim && spiel.heim === heimTeamId) {
                    oVereine[spiel.gast] = {
                        teamId: spiel.gast,
                        name: oTeams[spiel.gast].name
                    };
                    if (spiel.gast && spiel.gast == gastTeamId) {
                        sSpielID = spiel.id;
                    }
                }
            }
        }
    }

    if (sSpielID !== "") {
        document.getElementById("spielId").value = sSpielID;
    } else {
        document.getElementById("spielId").value = "";
    }

    var oOptions = document.getElementById("teamgast").options;
    for (var i = 0; i<oOptions.length; i++) {
        var bDisabled = (!oVereine[oOptions.item(i).value]);
        oOptions.item(i).disabled = bDisabled;
        oOptions.item(i).style.display = (bDisabled) ? "none" : "inherit";
    };

    if (heimTeamId) {
        document.getElementById("emailHeim").value = oTeams[heimTeamId].teamvertreter.mail;
    }
    if (gastTeamId) {
        document.getElementById("emailGast").value = oTeams[gastTeamId].teamvertreter.mail;
    }


    $('.selectpicker').selectpicker('render');

    if (heim.selectedIndex != 0 && gast.selectedIndex != 0 && heim.selectedIndex != gast.selectedIndex
        && !document.getElementById("teamgast").item(gast.selectedIndex).disabled) {
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

	document.getElementById("heimFeldInTable").innerHTML = vereine[heim].name;
	document.getElementById("gastFeldInTable").innerHTML = vereine[gast].name;

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

function compare(a,b) {
    if (a.name < b.name)
        return -1;
    else if (a.name > b.name)
        return 1;
    else
        return 0;
}

function initializeGameSelectionScreen(oVereine) {

	var aVereine = [];
    var i = 0;
    for (var key in oVereine) {
        aVereine.push(oVereine[key]);
        aVereine[i].id = key;
        i++;
    }

	//global Variable vereine is used everywhere else...
	vereine = oVereine;

    aVereine.sort(compare);

	for (var i = 0; i<aVereine.length; i++) {
		$('#teamheim').append($("<option/>", {value: aVereine[i].id,text: aVereine[i].name}));
		$('#teamgast').append($("<option/>", {value: aVereine[i].id,text: aVereine[i].name}));
	};

    //document.getElementById("teamgast").disabled = true;

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
var oSpielplan = null;
var oTeams = null;

$.getJSON("data/ergebnisse.json", function(ergebnisseFromFile) {
	window.localStorage.setItem("ergebnisseLeer", JSON.stringify(ergebnisseFromFile));
});

$.getJSON("/saison/1516/Spielplan.json", function(spielplan){
    oSpielplan = spielplan;
});

$.getJSON("/saison/1516/Teams.json", function(teams){
    oTeams = teams;
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
