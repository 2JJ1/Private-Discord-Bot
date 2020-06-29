//Checks if string has all of the strings in the words array
module.exports = function TextHasWords(text, words){
	//Simplify parsing
	text = text.toLowerCase()
	
	//Check all words
	for(index in words){
		//Define the word to check for
		let word = words[index]
		
		if(Array.isArray(word)){
			// Must contain either of the words in the array
			
			let hasWord = false
			
			for(subword in word){
				let _word = word[subword].toLowerCase();
				
				//Check if string has the word
				if(text.indexOf(_word) !== -1){
					//String has word
					hasWord = true
					break
				}
			}
			
			if(!hasWord) return false;
		} 
		else {
			//Must contain the word
			
			//Simplify parsing
			word = word.toLowerCase();
			
			//If string does not have the word
			if(text.indexOf(word) === -1) return false
		}
	}
	//No early exit, so must've passed
	return true
}