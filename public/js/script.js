// base url for the API
const BASE_URL = `http://localhost:3000/api`;

// check login status
checkLogin();

// populate the homepage where applicable
if(document.querySelector('.home-page') != null){
    let resultsDiv = document.querySelector("#results");

    // clear the resultsDiv
    resultsDiv.innerHTML = "";

    let url = `${BASE_URL}/accomodation/all`;

    // fet the results from API through AJAX
    fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        let out = `<p><strong>${res.length}</strong> result(s) found</p><hr>`;

        // loop to display results
        res.forEach((accommodation) => {
            out += generateAccomodationCard(accommodation);
        });

        // add the list of accomodation to page
        resultsDiv.innerHTML = out;

        // load the maps
        loadMaps(res);
    });
}

// add event listeners to the various forms
document.addEventListener('submit', function(e){
    // event listener for the search by location button
    if(e.target && e.target.id === 'search-by-location-form'){
        e.preventDefault();
    
        let location = document.querySelector('#location').value;

        let resultsDiv = document.querySelector("#results");

        // clear the resultsDiv
        resultsDiv.innerHTML = "";
    
        let url = `${BASE_URL}/accomodation/${location}`;
    
        // fet the results from API through AJAX
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            let out = `<p><strong>${res.length}</strong> result(s) found for <strong>${location}</strong></p><hr>`;

            // loop to display results
            res.forEach((accommodation) => {
                out += generateAccomodationCard(accommodation);
            });

            // add the list of accomodation to page
            resultsDiv.innerHTML = out;

            // load the maps
            loadMaps(res);
        });
    }

    // event listener for the search by location button
    if(e.target && e.target.id === 'search-by-type-location-form'){
        e.preventDefault();
    
        let location = document.querySelector('#location').value;
        let type = document.querySelector('#type').value;

        let resultsDiv = document.querySelector("#results");

        // clear the resultsDiv
        resultsDiv.innerHTML = "";
    
        let url = `${BASE_URL}/accomodation/${type}/${location}`;
    
        // fet the results from API through AJAX
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            let out = `<p><strong>${res.length}</strong> result(s) found for <strong>${type}</strong> in <strong>${location}</strong></p><hr>`;

            // loop to display results
            res.forEach((accommodation) => {
                out += generateAccomodationCard(accommodation);
            });

            // add the list of accomodation to page
            resultsDiv.innerHTML = out;

            // load the maps
            loadMaps(res);
        });
    }

    if(e.target && e.target.id === 'book-accomodation-form'){
        e.preventDefault();

        checkLogin();

        const acc_id = document.querySelector('#acc_id').value;
        const no_of_people = document.querySelector('#no_of_people').value;
        const date = "" + document.querySelector('#year').value + document.querySelector('#month').value + document.querySelector('#day').value;
        const card_no = document.querySelector('#card-no').value;

        let url = `${BASE_URL}/booking/create`;

        const body = JSON.stringify({
            acc_id: acc_id,
            no_of_people: no_of_people,
            date: date,
            card_no: card_no
        }); 
    
        // fet the results from API through AJAX
        fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        })
        .then(res => {
            // get the response as a promise then parse as json
            res.json().then(jsonResponse => {
                if(res.ok){
                    document.querySelector("#response").innerHTML = `<span style = "color: green">${jsonResponse.msg}</span>`;
                }else{
                    document.querySelector("#response").innerHTML = `<span style = "color: red">${jsonResponse.msg}</span>`;
                }
            });
        });
        

    }

    if(e.target && e.target.id === 'login-form'){
        e.preventDefault();

        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;

        let url = `${BASE_URL}/login`;

        const body = JSON.stringify({
            username: username,
            password: password
        }); 
    
        // fet the results from API through AJAX
        fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
        .then(res => {
            // get the response as a promise then parse as json
            res.json().then(jsonResponse => {
                if(res.ok){
                    document.querySelector("#response").innerHTML = `<span style = "color: green">${jsonResponse.msg}</span>`;
                    checkLogin();
                }else{
                    document.querySelector("#response").innerHTML = `<span style = "color: red">${jsonResponse.msg}</span>`;
                }
            });
        });
    }
});

// add event listeners to the various forms
document.addEventListener('click', function(e){
    // event listener for the search by location button

    if(e.target && e.target.classList.contains('book')){
        e.preventDefault();

        document.querySelector("#modal").style.display = 'initial';
        document.querySelector('#acc_id').value = e.target.getAttribute('data-id');
        
    }

    if(e.target && e.target.classList.contains('close')){
        document.querySelector("#modal").style.display = 'none';
    }
});

// function to generate individual accomodation as cards
function generateAccomodationCard(accommodation){
    return `
        <div class = "card">
            <div class = "card-body">
                <div class = "map" id = "map-${accommodation.ID}">
                </div>

                <div>
                    <p> ${accommodation.name}<br>
                    Type: ${accommodation.type}<br>
                    Location: ${accommodation.location}
                    </p>

                    <p><strong>Description</strong><br>
                        ${accommodation.description}
                    </p>

                    <a class = "button book" data-id = "${accommodation.ID}" href = "#">Book Now</a>
                </div>
            </div>
        </div>
    `;
}

// function to load maps to page
function loadMaps(accommodationList){
    accommodationList.forEach(accommodation => {
        let map = L.map(`map-${accommodation.ID}`).setView([accommodation.latitude, accommodation.longitude], 7);
                        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        let marker = L.marker([accommodation.latitude, accommodation.longitude]).addTo(map);

        marker.bindPopup(`
            <p>
                <b>${accommodation.name}</b><br>
                <i>${accommodation.description}</i>
            </p>
            
            Make a reservation <br>

            <form action="" id = "book-accomodation-form">
                <input type="hidden" name="acc_id" id="acc_id" required value = "${accommodation.ID}">
                <input type="number" name="no_of_people" id="no_of_people" required min="1" placeholder = "number of guests">
                <div class = "date-div">

                    <select name="day" id="day">
                        <option value="01" selected>01</option>
                        <option value="02">02</option>
                        <option value="03">03</option>
                        <option value="04">04</option>
                        <option value="05">05</option>
                        <option value="06">06</option>
                        <option value="07">07</option>
                        <option value="08">08</option>
                        <option value="09">09</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                        <option value="17">17</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                        <option value="20">20</option>
                        <option value="21">21</option>
                        <option value="22">22</option>
                        <option value="23">23</option>
                        <option value="24">24</option>
                        <option value="25">25</option>
                        <option value="26">26</option>
                        <option value="27">27</option>
                        <option value="28">28</option>
                        <option value="29">29</option>
                        <option value="30">30</option>
                        <option value="31">31</option>
                    </select>

                    <select name="month" id="month">
                        <option value="01" selected>January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>

                    <select name="year" id="year">
                        <option value="22" selected>2022</option>
                        <option value="23">2023</option>
                        <option value="24">2024</option>
                        <option value="25">2025</option>
                        <option value="26">2026</option>
                        <option value="27">2027</option>
                        <option value="28">2028</option>
                        <option value="29">2029</option>
                        <option value="30">2030</option>
                    </select>

                    
                </div>
                <input type="text" name="card_no" id="card-no" placeholder = "credit card number" required>
                <br><span id = "response">&nbsp;</span><br>
                <button type="submit">Book Accomodation</button>
            </form>
        `);
    });
}

// function to check in the login status
function checkLogin(){
    let url = `${BASE_URL}/login/check`;

    // fet the results from API through AJAX
    fetch(url, {
        method: 'POST',
        credentials: 'include',
    })
    .then(res => {
        // get the response as a promise then parse as json
        res.json().then(jsonResponse => {
            if(res.ok){
                document.querySelector("#login-status").innerHTML = jsonResponse.msg;
            }else{
                document.querySelector("#login-status").innerHTML = `<span style = "color: red">${jsonResponse.msg}</span>`;
            }
            
        });
    });
}