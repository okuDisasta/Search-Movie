const todoInput = document.querySelector('.search-input')
const todoList = document.querySelector('.todo-list')
const recSection = document.querySelector('.carousel-slide')
const body = document.querySelector('body')

let current;
let pathLocation
let slider;

//Handle request
const modal = document.getElementById("myModal")
const reqBtn = document.querySelector(".request-button");
const submitReqBtn = document.querySelector(".submit-btn");




let fileIndex;
let recommendation;
let moviePosters = []
let movieDir = []
let movieDirForRec = []
let index;


window.onload = () => {
	eel.scan()(result => {
		console.log("scanning finish")
		fileIndex = result
		showPage()
		eel.recommendation(fileIndex)(async recResult => {
			recommendation = recResult
			
			for(i=0; i <20; i++) {
				whileLoop: { 
					while(true) {
						let movieCount = recommendation.length - 1
						let random = Math.floor(Math.random() * movieCount)
						let dirPath = recommendation[random]
						
						/*console.log(random)
						console.log(recommendation.length)
						console.log(dirPath)*/
						
						let filename = dirPath.replace(/^.*[\\\/]/, '')
						let movieName = filename.substring(0, filename.indexOf("(") - 1)

						
						let moviePoster = await fetch(`http://www.omdbapi.com/?apikey=47bb3c38&t=${movieName}`)
							.then(res => {
								if (res.status >= 400 && res.status < 600) {
									throw new Error("Bad response from server");
								}
								return res.json()
							})
							.then(resJson => {
								return resJson.Poster
							})
							.catch((err) => {
								//console.log("error has occured")
								return ("error")
							})
						
						//console.log(moviePoster)
						
						if(moviePoster === undefined) {
							recommendation.splice(random, 1)
							//console.log("poster undefined")
						} else if(moviePoster === "error" || moviePoster === "N/A") {
							recommendation.splice(random, 1)
							continue
						} else {
							moviePosters.push(moviePoster)
							movieDirForRec.push(dirPath)
							const recPoster = document.createElement('img')
							recPoster.classList.add('rec-poster')
							recPoster.src = moviePoster
							recPoster.addEventListener("click", () => {
								eel.openFile(dirPath)
								//console.log("listening")
							})
							recSection.appendChild(recPoster)
							recommendation.splice(random, 1)
							console.log(random)
							break whileLoop
						}
					}
				}
			}
			
			//first poster
			const firstPoster = document.createElement('img')
			firstPoster.classList.add('rec-poster')
			firstPoster.setAttribute("id", "lastClone")
			firstPoster.src = recSection.lastChild.src
			recSection.insertBefore(firstPoster, recSection.firstChild)
			
			//last poster
			const lastPoster = document.createElement('img')
			lastPoster.classList.add('rec-poster')
			lastPoster.setAttribute("id", "firstClone")
			lastPoster.src = recSection.childNodes[1].src
			recSection.appendChild(lastPoster)
			
			for(i = 1; i < moviePosters.length; i++) {
				const afterLastPoster = document.createElement('img')
				afterLastPoster.classList.add('rec-poster')
				afterLastPoster.src = moviePosters[i]
				let additionDirPath = movieDirForRec[i]
				afterLastPoster.addEventListener("click", () => {
					eel.openFile(additionDirPath)
				})
				recSection.appendChild(afterLastPoster)
			}
			
			
			const posters = document.querySelectorAll('.rec-poster')
			
			let counter = 1
			let size = 120
			recSection.style.transform = 'translateX(' + (-size * counter) + 'px)'
			
			reqBtn.innerText = "Request";
			reqBtn.style.backgroundColor = "#008CBA";
			const reqBtnWrapper = document.getElementsByClassName("req-btn-wrapper")[0]
			reqBtnWrapper.style.cursor = "auto"
			reqBtn.style.cursor = "pointer"
			reqBtn.style.pointerEvents = "auto"
			reqBtn.onmouseover = function(){
				reqBtn.style.backgroundColor = "#00b2ed";
			};
			
			reqBtn.onmouseout = function(){
				reqBtn.style.backgroundColor = "#008CBA";
			};
			
			reqBtn.onclick = function() {
			  modal.style.display = "block";
			  clearInterval(slider);
			}

			window.onclick = function(event) {
			  if (event.target == modal) {
				modal.style.display = "none";
				slider = setInterval(slide, 5000)
			  }
			}
			
			submitReqBtn.addEventListener("click", sendRequest)

			function sendRequest() {
				const title = document.querySelector(".title")
				const year = document.querySelector(".year")
				const country = document.querySelector(".country")
				const note = document.querySelector(".note")
				
				t = title.value
				y = year.value
				c = country.value
				n = note.value
				
				let botMessage = "Title = " + t + "\nYear = " + y + "\nCountry = " + c + "\nNote = " + n
				
				if(t !== "") {
					eel.telegram_bot_sendtext(botMessage)
				
					title.value = ""
					year.value = year.childNodes[1].attributes[0].value
					country.value = country.childNodes[1].attributes[0].value
					note.value = ""

					modal.style.display = "none";
					slider = setInterval(slide, 5000)
				} else {
					console.log("empty")
				}
				
			}

			
			function slide() {
				recSection.removeEventListener('transitionend', () => {
					//console.log("remove listener")
				})
				recSection.style.transition ='transform 0.7s ease-in-out'
				counter--
				recSection.style.transform = 'translateX(' + (-size * counter) + 'px)'
				
				
				recSection.addEventListener('transitionend', back())
			}
			
			function back() {
				if(posters[counter].id === 'lastClone') {
					recSection.style.transition = 'none'
					counter = posters.length - 20
					recSection.style.transform = 'translateX(' + (-size*counter) + 'px)'
				} else if (posters[counter].id === 'firstClone') {
					recSection.style.transition = 'none'
					counter = posters.length - counter - 7
					recSection.style.transform = 'translateX(' + (-size*counter) + 'px)'
				}
			}
			
			slider = setInterval(slide, 5000)
		})
	})
	
	body.addEventListener("mousedown", (e) => {
		current = document.getElementsByClassName("active")[0]
		if(current !== undefined) {
			current.className = current.className.replace(" active", "");
		}
		
		if(pathLocation !== undefined) {
			pathLocation.style.display = "none"
		}
		
		if(e.button === 2) {
			if(e.target.classList[0] === "todo") {
				index = parseInt(e.target.id)
				pathLocation.style.display = "block"
				
				const coords = e.target.getBoundingClientRect()
				const directions = {
								top: e.target.offsetTop,
								left: coords.left
							}
				pathLocation.style.setProperty("left", `${directions.left}px`)
				pathLocation.style.setProperty("top", `${directions.top}px`)			
				e.target.className += " active";
				
				
			} else if(e.target.parentNode.classList[0] === "todo") {
				index = parseInt(e.target.parentNode.id)
				pathLocation.style.display = "block"
				
				const coords = e.target.parentNode.getBoundingClientRect()
				const directions = {
								top: e.target.parentNode.offsetTop,
								left: coords.left
							}
				pathLocation.style.setProperty("left", `${directions.left}px`)
				pathLocation.style.setProperty("top", `${directions.top}px`)
				e.target.parentNode.className += " active";
				console.log("yo")
				console.log(directions.top)
				//pathLocation.addEventListener("click", eelOpenDir(movieDir[index]))
			}
		}
		if(e.button === 0) {
			if(e.target.classList[0] === "todo") {
				e.target.className += " active";
			} else if(e.target.parentNode.classList[0] === "todo") {
				e.target.parentNode.className += " active";
			}
			
			if(e.target.classList[0] === "location") {
				pathLocation.removeEventListener("click", () => console.log("zz"))
				pathLocation.addEventListener("click", eelOpenDir(movieDir[index]))
				//console.log(movieDir[index])
			}
		}
	})
}


todoInput.addEventListener("keyup", debounce(() => {
	searchMovie()
}, 500))
	

//Functions
function searchMovie() {
	eel.search(todoInput.value, fileIndex)((results) => {
		while (todoList.hasChildNodes()) {  
			todoList.removeChild(todoList.firstChild);
		}
		
		const locTab = document.createElement('div')
		locTab.classList.add('location')
		locTab.innerText = "Location"
		todoList.appendChild(locTab)
		
		pathLocation = locTab
		
		if(results[1] === 0 && todoInput.value !== "") {
			todoList.innerText = "File Not Found"
		} else if(todoInput.value === "") {
			return
		} else {
			movieDir = []
			results[0].map((result, index) => {
				//Prevent form from submitting
				event.preventDefault()
				let path = result
				
				//Todo DIV
				const todoDiv = document.createElement('div')
				todoDiv.classList.add('todo')
				todoDiv.setAttribute("id", `${index}`)			
				
				//Create LI
				const movieIcon = document.createElement('div')
				movieIcon.classList.add('file-image')
				generateColor(movieIcon)
				todoDiv.appendChild(movieIcon)
				
				//file name
				const fileNameBox = document.createElement('div')
				fileNameBox.classList.add('filename-box')
				todoDiv.appendChild(fileNameBox)
				const filename = result.replace(/^.*[\\\/]/, '')
				fileNameBox.innerText = filename
				
				//APPEND TO LIST
				todoList.appendChild(todoDiv)
				
				const lastItem = result.substring(0, result.lastIndexOf('/'))
				movieDir.push(lastItem)
				
				const unsubscribe = todoDiv.addEventListener("dblclick", () => {
					eel.openFile(result)(res => {
						console.log(res)
					})
					window.blur()
					
				})
				
				
				return () => {
					unsubscribe();
					unsubscribe2();
				}
			})
		}
	})
}

function eelOpenDir(path) {
	eel.openDir(path)
}

function generateColor(element) {
	const randomColor = Math.floor(Math.random()*16777215).toString(16);
	element.style.backgroundColor = "#" + randomColor;
}

function debounce(a,b,c){
  var d,e;
  return function(){
    function h(){
      d=null;
      c||(e=a.apply(f,g));
    }
    var f=this,g=arguments;
    return (clearTimeout(d),d=setTimeout(h,b),c&&!d&&(e=a.apply(f,g)),e)
  }
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("app-body").style.display = "block";
  document.getElementById("app-container").removeAttribute("id");
}