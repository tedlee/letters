/*
TODO:
- DONE - Fix suggestionsth button bug
- DONE - Dictionary lookup
- DONE - sort list by length
- DONE - File uplaod dialog
- OCR letters from image

*/

$(document).ready(function() {
	
	var ptrie;
	letterSet = false;

	// Adds a listener for file upload
	document.getElementById('files').addEventListener('change', handleFileSelect, false);

	// See if the dictionary we want is pre-cached in localStorage
	if ( window.localStorage !== null && window.localStorage.gameDict ) {
		console.log("I have the dictionary already!");
		dictReady( window.localStorage.gameDict );
	}
	// Load in the dictionary from the server
	else {
		jQuery.ajax({
			url: "scripts/production_dict.js",
			dataType: "jsonp",
			jsonp: false,
			jsonpCallback: "dictLoaded",
			success: function( txt ) {
			// Cache the dictionary, if possible
			if ( window.localStorage !== null ) {
				window.localStorage.gameDict = txt;
				console.log("Alright, I grabbed a new instance of the dictionary for you. It's in localStorage!");
			}
				dictReady( txt );
			}
		});
	}


	// Validate keyup event is alphabetic character
	// If character is valid set focus to next input box
	$("form").delegate ("input", "keyup", function() {
		var inLetter = $(this).val();

		if (/[a-z]/.test(inLetter)) {
			$(this).nextAll("input").first().focus().select();
		}
	});

	// On click of input box set focus to that input box
	$("form").delegate ("input", "click", function() {
		$(this).focus().select();
	});

	
	// One the letters have been submitted this allows the user
	// to change the colour of the game tiles
	// The tiles cycle through grey -> blue -> red
	$("form").delegate ("input", "click", function() {

		var red = "rgb(247, 153, 141)";
		var blue = "rgb(120, 201, 246)";
		var grey = "rgb(232, 231, 228)";
	 
		if (letterSet === true) {
			var color = $(this).css('backgroundColor');

			if (color == grey) {
				$(this).css('backgroundColor', blue); //set to blue
			}
			else if (color == blue) { // if blue
				$(this).css('backgroundColor', red); //set to red
			}
			else if (color == red) { // if red
				$(this).css('backgroundColor', grey); //set to grey
			}
		}
	});


	// Grabs all the letters and puts them in an array
	$("#lettersForm").submit(function() {
		console.log("Button clicked");
		var lettersJSON = $("#lettersForm").serializeArray();
		letters = [];
		letterSet = true;
		console.log("Button pressed");
		
		// Parses the JSON from serializeArray() putting
		// it into a clean array
		$.each(lettersJSON, function() {
			letters.push(this.value);
		});
		
		console.log(letters);
		getWords(letters);
		
		// If you don't return false will try
		// to forward you to non-existing page
		return false;
	});

	// Listens for status change in checkbox
	$("checkbox").change( function(){
		if ($(this).is(':checked')) {
			alert('checked');
		}
	});


});


function dictReady( txt ) {
	console.log("Loading library into ptrie variable");
    var ptrieLib = namespace.lookup('org.startpad.trie.packed');
    ptrie = new ptrieLib.PackedTrie(txt);
}


function getWords( letters ) {

	// Takes array of letters and sorts them alphabetically and then concatenates them into a single string
	var tiles = letters.sort().join("");
	

	// Dictionary lookup logic

	// Creates a simple regex with the tiles
	var tilesRegExp = new RegExp("^[" + tiles + "]*$");

	/*

	Usage:

	ptrie.words("") returns dictionary array

	ptrie = new PackedTrie(<string> compressed);
	bool = ptrie.isWord(word);
	longestWord = ptrie.match(string);
	matchArray = ptrie.matches(string);
	wordArray = ptrie.words(from, beyond, limit);
	ptrie.enumerate(inode, prefix, context);

	words() - return all strings in dictionary - same as words('')
	words(string) - return all words with prefix
	words(string, limit) - limited number of words
	words(string, beyond) - max (alphabetical) word
	words(string, beyond, limit)
    
	*/

	// .filter returns all the passing cases to ptrie.words

	words = ptrie.words("").filter(function(word) {
		if (tilesRegExp.test(word) && (new RegExp(word.split("").sort().join(".*?"))).test(tiles)) {
			return true;
		}
	});
	
	//console.log( "Words are: " + words);
	var longest = words.reduce(function ( a, b ) { return a.length > b.length ? a : b; });
	console.log("The longest word is: " + longest);

	$("ul").empty();

	// Sorts the words array by string length
	words.sort( byStringLength );

	// Display the 100 longest words
	if (words.length > 100){
		for (var i = 0; i < 100; i++) {
			$('#suggestions ul').append($('<li>').append(words[i] + "  (" + String(words[i].length) + ")" ));
		}
	} else {alert("Less than 100 permutation. Sure you entered that correctly?")}
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    singleFile = files[0];
    //console.log(files);

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		reader = new FileReader();
		reader.onload = (function(singleFile) {
			console.log("More inside file handling: " + this);

			var lettersFromImage = OCR.recognize(this.result);

			console.log(lettersFromImage);
		});

		reader.readAsDataURL(evt.target.files[0]);
	}
}

// Quick helper function for sorting the words by length
function byStringLength( a,b ) {
	if ( a.length > b.length )
		{ return -1;} // current word is longer than next word
	else if (a.length < b.length)
		{ return 1;} // current word is shorter than next word
	else { return 0; }
}























