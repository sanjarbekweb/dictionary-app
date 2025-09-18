let searchHistory = JSON.parse(localStorage.getItem('dictionaryHistory')) || []
let isLoading = false

async function validateWord(word) {
	try {
		const response = await fetch(
			`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
		)
		const data = await response.json()
		return response.ok && data.title !== 'No Definitions Found'
	} catch (error) {
		return false
	}
}

function updateHistory(word) {
	if (!searchHistory.includes(word)) {
		searchHistory.unshift(word)
		if (searchHistory.length > 5) searchHistory.pop()
		localStorage.setItem('dictionaryHistory', JSON.stringify(searchHistory))
	}
	displayHistory()
}

function displayHistory() {
	const historyDiv = document.getElementById('history')
	historyDiv.innerHTML = ''
	if (searchHistory.length > 0) {
		historyDiv.innerHTML =
			'<p class="text-sm font-semibold mb-3 text-[#F5F5F5]">So\'nggi qidiruvlar:</p>'
		searchHistory.forEach(word => {
			const item = document.createElement('div')
			item.className = 'history-item'
			item.textContent = word
			item.onclick = () => {
				document.getElementById('word-input').value = word
				getDefinition()
			}
			historyDiv.appendChild(item)
		})
		const clearBtn = document.createElement('div')
		clearBtn.className = 'clear-history'
		clearBtn.textContent = 'Tarixni tozalash'
		clearBtn.onclick = () => {
			searchHistory = []
			localStorage.removeItem('dictionaryHistory')
			displayHistory()
		}
		historyDiv.appendChild(clearBtn)
	}
}

async function getSuggestions() {
	if (isLoading) return
	isLoading = true
	const query = document.getElementById('word-input').value.trim().toLowerCase()
	const suggestionsDiv = document.getElementById('suggestions')
	const loading = document.getElementById('loading')
	suggestionsDiv.innerHTML = ''
	loading.style.display = 'block'

	if (query.length < 2) {
		loading.style.display = 'none'
		isLoading = false
		return
	}

	try {
		const response = await fetch(`https://api.datamuse.com/sug?s=${query}`)
		const data = await response.json()
		const validSuggestions = []

		for (const sug of data.slice(0, 10)) {
			if (await validateWord(sug.word)) {
				validSuggestions.push(sug.word)
				if (validSuggestions.length >= 5) break
			}
		}

		if (validSuggestions.length > 0) {
			suggestionsDiv.innerHTML =
				'<p class="text-sm font-semibold mb-3 text-[#F5F5F5]">Takliflar:</p>'
			validSuggestions.forEach(word => {
				const item = document.createElement('div')
				item.className = 'suggestion-item'
				item.textContent = word
				item.onclick = () => {
					document.getElementById('word-input').value = word
					getDefinition()
				}
				suggestionsDiv.appendChild(item)
			})
		}
	} catch (error) {
		console.error(error)
	} finally {
		loading.style.display = 'none'
		isLoading = false
	}
}

async function getDefinition() {
	if (isLoading) return
	isLoading = true
	const wordInput = document
		.getElementById('word-input')
		.value.trim()
		.toLowerCase()
	const wordInfo = document.getElementById('word-info')
	const errorDiv = document.getElementById('error')
	const searchBtn = document.getElementById('search-btn')
	const loading = document.getElementById('loading')

	searchBtn.disabled = true
	loading.style.display = 'block'
	wordInfo.classList.add('hidden')
	errorDiv.classList.add('hidden')
	wordInfo.innerHTML = ''
	errorDiv.innerHTML = ''

	if (!wordInput) {
		errorDiv.classList.remove('hidden')
		errorDiv.innerHTML = "Iltimos, so'z kiriting!"
		searchBtn.disabled = false
		loading.style.display = 'none'
		isLoading = false
		return
	}

	try {
		const response = await fetch(
			`https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`
		)
		const data = await response.json()

		if (!response.ok || data.title === 'No Definitions Found') {
			errorDiv.classList.remove('hidden')
			errorDiv.innerHTML = "So'z topilmadi!"
			searchBtn.disabled = false
			loading.style.display = 'none'
			isLoading = false
			return
		}

		updateHistory(wordInput)

		wordInfo.classList.remove('hidden')
		let html = `<p class="text-xl font-semibold">${data[0].word}</p>`

		const phonetics = data[0].phonetics.find(p => p.text && p.audio)
		if (phonetics) {
			html += `
                        <div class="flex items-center gap-3 mt-2">
                            <p class="text-sm">${phonetics.text}</p>
                            ${
															phonetics.audio
																? `<div class="audio-btn" onclick="new Audio('${phonetics.audio}').play()">&#9658;</div>`
																: ''
														}
                        </div>`
		}

		data[0].meanings.forEach(meaning => {
			html += `<p class="mt-4 text-sm font-semibold">${meaning.partOfSpeech}</p>`
			meaning.definitions.forEach((def, index) => {
				html += `<p class="text-sm mt-1">${index + 1}. ${def.definition}</p>`
				if (def.example) {
					html += `<p class="text-xs italic mt-1">Misol: ${def.example}</p>`
				}
			})
			if (meaning.synonyms && meaning.synonyms.length > 0) {
				html += `<p class="text-sm mt-2">Sinonimlar: ${meaning.synonyms.join(
					', '
				)}</p>`
			}
			if (meaning.antonyms && meaning.antonyms.length > 0) {
				html += `<p class="text-sm mt-1">Antonimlar: ${meaning.antonyms.join(
					', '
				)}</p>`
			}
		})

		wordInfo.innerHTML = html
	} catch (error) {
		errorDiv.classList.remove('hidden')
		errorDiv.innerHTML = 'Xatolik yuz berdi. Internetni tekshiring!'
		console.error(error)
	} finally {
		searchBtn.disabled = false
		loading.style.display = 'none'
		isLoading = false
	}
}

document
	.getElementById('word-input')
	.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') getDefinition()
	})

displayHistory()
