document.addEventListener("DOMContentLoaded", async function () {
    await loadTable();
});

let auth = {
    token: null,
    _id: null,
};

function fadein(element) {
    let opacity = 0;
    let fadeIn = setInterval(() => {
        if (opacity >= 1) {
            clearInterval(fadeIn);
        }
        element.style.opacity = opacity;
        opacity += 0.01;
    }, 5);

}

async function loadDefaultPage() {
    // table tbody
    const tbody = document.getElementById("tb");
    tbody.innerHTML = '<tr></tr>';
    tbody.innerHTML += '<tr><td colspan="11">You need to login first.</td></tr>';

    // search bar
    const search = document.getElementById("search");
    search.disabled = true;
    search.style.cursor = 'not-allowed';

    // profile
    const profile = document.getElementById("profile");
    profile.innerHTML = `
        <input type="text" id="username" placeholder="username">
        <input type="password" id="password" placeholder="password">
        <button onclick="login()">
            <i class="fa-solid fa-right-to-bracket"></i>
        </button>
    `;

    // Show message for map
    document.getElementById('map').innerHTML = `
        <div style='text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 32px'>
            you need to login to see map.
        </div>
    `;
}

async function checkToken() {

    const token = localStorage.getItem('token') || undefined;

    if (!token || token == undefined) {
        loadDefaultPage();
        return false;
    } else {
        try {
            const url = "http://localhost:3000/api/checkAuth"
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }

            const status = await fetch(url, options)
                .then(response => response.json())
                .then(data => {
                    if (data.message == "vertify success." && data.data) {
                        auth.token = token;
                        auth._id = data.data._id;
                        return true;
                    } else if (data.error) {
                        Swal.fire({
                            title: `${data.error}`,
                            text: `Try to login again.`,
                            icon: "warning"
                        });
                        return false;
                    } else {
                        return false;
                    }
                })
                .catch(error => {
                    console.log(error);
                    Swal.fire({
                        title: `Server down 404`,
                        text: `Please contact us.`,
                        icon: "error"
                    });
                    return false;
                })
            if (status == false) {
                loadDefaultPage();
            }

            return status;

        } catch (error) {
            console.log(error)
        }
    }
}

async function fetchHotels() {

    const status = await checkToken();

    if (status == false) {
        return false;
    }

    const token = auth.token;

    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include token in request headers
        }
    };

    return await fetch("http://localhost:3000/api/hotel/v1/allHotels", options)
        .then(response => response.json())
        .then(data => {
            const hotels = data.map(({ latitude, longitude, ...rest }) => ({
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
                ...rest
            }));
            return hotels;
        })
        .catch(error => {
            console.error(error);
            throw error;
        })
}

async function loadTable() {

    hotels = await fetchHotels();

    if (hotels == false) {
        return;
    }

    const search = document.getElementById("search");
    search.disabled = false;
    search.style.cursor = 'text'

    const profile = document.getElementById("profile");
    profile.innerHTML = `<button onclick="openNewHotel()" style="margin-right: 1em; font-weight: bold; width: fit-content; padding: 0 1em;"><i class="fa-solid fa-plus"></i> New Hotel</button><button onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i></i></button>`;

    let tb = document.getElementById("tb").innerHTML = '<tr></tr>'

    if (hotels == 0) {
        document.getElementById("tb").innerHTML += '<tr><td colspan="11">Not found</td></tr>'
    }

    const table = document.getElementById("table")

    for (let i = 0; i < hotels.length; i++) {
        const hotel = hotels[i];
        const row = table.insertRow();
        fadein(row)
        const cell_locationId = row.insertCell()
        const cell_name = row.insertCell()
        const cell_street1 = row.insertCell()
        const cell_country = row.insertCell()
        const cell_city = row.insertCell()
        const cell_state = row.insertCell()
        const cell_postalcode = row.insertCell()
        const cell_latitude = row.insertCell()
        const cell_longitude = row.insertCell()
        const cell_rating = row.insertCell()
        const cell_tool = row.insertCell()
        try {
            row.setAttribute("id", `${hotel["location_id"]}`)
            cell_locationId.innerHTML = `${hotel["location_id"]}`;
            cell_name.innerHTML = `${hotel["name"]}`;
            cell_street1.innerHTML = `${hotel["address_obj"]["street1"]}`;
            cell_country.innerHTML = `${hotel["address_obj"]["country"]}`;
            cell_city.innerHTML = `${hotel["address_obj"]["city"]}`;
            cell_state.innerHTML = `${hotel["address_obj"]["state"]}`;
            cell_postalcode.innerHTML = `${hotel["address_obj"]["postalcode"]}`;
            cell_latitude.innerHTML = `${hotel["lat"]}`;
            cell_longitude.innerHTML = `${hotel["lon"]}`;
            cell_rating.innerHTML = `${hotel["rating"]}`;
            cell_tool.innerHTML = `<div class="tool"><button onclick="openEditBox(${hotel["location_id"]})"><i class="fas fa-edit"></i></button><button onclick="deleteHotels(${hotel["location_id"]})"><i class="fas fa-trash-alt"></i></button></div>`;
        } catch (error) {
            console.log(error)
        }
    }
    await init();
    await loopPopUp(hotels);
    await dragMap(hotels);
    // document.getElementById("search").focus()
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = JSON.stringify({
        username: username,
        password: password
    });

    const url = "http://localhost:3000/api/user/v1/login";

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    };

    await fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (data.token || data._id) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('_id', data._id);
                Swal.fire({
                    title: "Login Success.",
                    text: `Login Successfully.`,
                    icon: "success"
                });
                loadTable();
            } else {
                Swal.fire({
                    title: "Login Fail.",
                    text: `${data.error}`,
                    icon: "error"
                });
            }
        })
        .catch(error => {
            console.log(error)
        })
}

async function logout() {

    const url = "http://localhost:3000/api/user/v1/logout"

    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}` // Corrected token usage
        },
        body: JSON.stringify({
            id: auth._id
        })
    }

    await fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (data.message == 'Logout successful') {
                Swal.   fire({
                    title: "Logout successful.",
                    text: `${data.message}`,
                    icon: "success"
                });
            }
        })
        .catch(error => {
            console.log(error)
        })
    document.getElementById("search").value = '';
    localStorage.clear()
    await checkToken()
}

async function loadQueayBySearh(event) {
    const searchVal = document.getElementById("search").value;
    if (searchVal.length == 0) {
        await loadTable();
        return;
    }
    url = `http://localhost:3000/api/hotel/v1/search/${searchVal}`;
    options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}` // Corrected token usage
        }
    };
    await fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const hotels = data.map(({ latitude, longitude, ...rest }) => ({
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
                ...rest
            }));

            let tb = document.getElementById("tb").innerHTML = '<tr></tr>'

            if (hotels == 0) {
                document.getElementById("tb").innerHTML += '<tr><td colspan="11">Not found</td></tr>'
            }

            const table = document.getElementById("table")

            for (let i = 0; i < hotels.length; i++) {
                const hotel = hotels[i];
                const row = table.insertRow();
                fadein(row)
                const cell_locationId = row.insertCell()
                const cell_name = row.insertCell()
                const cell_street1 = row.insertCell()
                const cell_country = row.insertCell()
                const cell_city = row.insertCell()
                const cell_state = row.insertCell()
                const cell_postalcode = row.insertCell()
                const cell_latitude = row.insertCell()
                const cell_longitude = row.insertCell()
                const cell_rating = row.insertCell()
                const cell_tool = row.insertCell()
                try {
                    row.setAttribute("id", `${hotel["location_id"]}`)
                    cell_locationId.innerHTML = `${hotel["location_id"]}`;
                    cell_name.innerHTML = `${hotel["name"]}`;
                    cell_street1.innerHTML = `${hotel["address_obj"]["street1"]}`;
                    cell_country.innerHTML = `${hotel["address_obj"]["country"]}`;
                    cell_city.innerHTML = `${hotel["address_obj"]["city"]}`;
                    cell_state.innerHTML = `${hotel["address_obj"]["state"]}`;
                    cell_postalcode.innerHTML = `${hotel["address_obj"]["postalcode"]}`;
                    cell_latitude.innerHTML = `${hotel["lat"]}`;
                    cell_longitude.innerHTML = `${hotel["lon"]}`;
                    cell_rating.innerHTML = `${hotel["rating"]}`;
                    cell_tool.innerHTML = `<div class="tool"><button onclick="openEditBox(${hotel["location_id"]})"><i class="fas fa-edit"></i></button><button onclick="deleteHotels(${hotel["location_id"]})"><i class="fas fa-trash-alt"></i></button></div>`;
                } catch (error) {
                    console.log(error)
                }
            }
            init();
            loopPopUp(hotels);
            dragMap(hotels);
        })
        .catch(error => {
            console.error(error);
            throw error;
        })

}

// map function

var map;
function init() {
    map = new longdo.Map({
        placeholder: document.getElementById('map')
    });
    map.location({ lon: 98.35, lat: 7.965 }, true);
    map.zoom(11, true);
    // map.Ui.lockMap()
    map.Ui.Toolbar.visible(false);
    map.Ui.Crosshair.visible(false);
    map.Ui.Scale.visible(false);
    map.Ui.Fullscreen.visible(false);
    map.Ui.LayerSelector.visible(false);
    map.Ui.Zoombar.visible(false);
    map.Ui.Geolocation.visible(false);
    map.Ui.DPad.visible(false);

}

async function loopPopUp(data) {
    const location = data;
    // const location = await fetchHotels();
    for (let index = 0; index < location.length; index++) {
        const hotel = location[index];
        const element = new longdo.Marker(
            { lat: hotel.lat, lon: hotel.lon },
            {
                title: hotel.name,
                detail: `
                    Location_id: ${hotel.location_id}
                    Address: ${hotel.address_obj.street1}, ${hotel.address_obj.city}, ${hotel.address_obj.state}, ${hotel.address_obj.country}, ${hotel.address_obj.postalcode}
                `
            }
        );
        map.Overlays.add(element);
    }
}

function dragMap(data) {
    const element = document.getElementById("drag");
    const adjustButton = document.getElementById("adjustButton");
    const wepHeight = document.getElementById("wep");
    let isMouseDown = false;
    let initialMouseY = 0;
    let initialHeight = 0;

    adjustButton.addEventListener("mousedown", function (event) {
        isMouseDown = true;
        initialMouseY = event.clientY;
        initialHeight = parseInt(getComputedStyle(element).height);
    });

    adjustButton.addEventListener("mouseup", async function () {
        isMouseDown = false;
        await init();
        await loopPopUp(data);
    });

    document.addEventListener("mousemove", function (event) {
        if (isMouseDown) {
            const bodyOffHeight = document.body.offsetHeight;
            const deltaY = event.clientY - initialMouseY; // Change direction here
            const newHeight = initialHeight - deltaY; // Revert direction
            if (newHeight <= 0) {
                newHeight = 0
            }
            if (newHeight >= bodyOffHeight - 20) {
                newHeight = 0
            }
            element.style.height = newHeight + "px";
            // Adjust top position for dragging upwards
            element.style.top = `${parseInt(element.style.top) + deltaY}px`; // Revert direction
            wepHeight.style.height = `${bodyOffHeight - newHeight}px`
        }
    });
}

// tool function

async function deleteHotels(id) {

    Swal.fire({
        title: "Are you sure?",
        text: "You information will delete!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            const url = "http://localhost:3000/api/hotel/v1/deleteHotel"
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.token}` // Include token in request headers
                },
                body: JSON.stringify({
                    location_id: id
                })
            };
            fetch(url, options)
                .then(response => response.json())
                .then(data => {
                    if (data.message == 'Delete Success') {
                        Swal.fire({
                            title: "Delete Success.",
                            text: `${data.message}`,
                            icon: "success"
                        });
                    } else if (data.message == 'Delete not success') {
                        Swal.fire({
                            title: "Delete Not Success.",
                            text: `Try to delete again.`,
                            icon: "warning"
                        });
                    } else {
                        Swal.fire({
                            title: "Delete Error.",
                            text: `${data.error}`,
                            icon: "error"
                        });
                    }
                    const searchVal = document.getElementById("search").value;
                    if (searchVal.length != 0) {
                        loadQueayBySearh()
                    } else {
                        loadTable()
                    }
                })
                .catch(error => {
                    console.log(error)
                    Swal.fire({
                        title: "Delete Error.",
                        text: `${error}`,
                        icon: "error"
                    });
                })
        } else {
            return
        }
    });


}

function closePopup() {
    const popup = document.getElementById("popup")
    const editBox = document.getElementById("editBox")
    popup.classList.remove("active")
    editBox.classList.remove("active")
}

function openPopup() {
    const popup = document.getElementById("popup")
    const editBox = document.getElementById("editBox")
    popup.classList.add("active")
    editBox.classList.add("active")
}

async function openEditBox(id) {
    document.getElementById("btn-new").style.display = 'none'
    document.getElementById("btn-edit").style.display = 'block'
    document.getElementById("title").innerHTML = 'EDIT HOTEL INFORMATION';
    await openPopup();
    try {
        const url = "http://localhost:3000/api/hotel/v1/getHotel/" + id
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.token}` // Corrected token usage
            }
        };
        await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                const in_p_id = document.getElementById("in-p-id");
                in_p_id.style.display = 'none'
                document.getElementById("location_id").value = `${data["location_id"]}`;
                document.getElementById("name").value = `${data["name"]}`;
                document.getElementById("street1").value = `${data["address_obj"]["street1"]}`;
                document.getElementById("city").value = `${data["address_obj"]["city"]}`;
                document.getElementById("state").value = `${data["address_obj"]["state"]}`;
                document.getElementById("postalcode").value = `${data["address_obj"]["postalcode"]}`;
                document.getElementById("country").value = `${data["address_obj"]["country"]}`;
                document.getElementById("latitude").value = `${data["latitude"]}`;
                document.getElementById("longitude").value = `${data["longitude"]}`;
                document.getElementById("rating").value = `${data["rating"]}`;
            })
            .catch(error => {
                console.log(error)
            })
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: 'Something wrong',
            text: `${error}`,
            icon: 'error'
        })
    }
}

async function saveEdit() {
    try {
        const location_id = document.getElementById("location_id").value;
        const name = document.getElementById("name").value;
        const street1 = document.getElementById("street1").value;
        const city = document.getElementById("city").value;
        const state = document.getElementById("state").value;
        const postalcode = document.getElementById("postalcode").value;
        const country = document.getElementById("country").value;
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const rating = document.getElementById("rating").value;
        const url = "http://localhost:3000/api/hotel/v1/updateHotel/" + location_id;
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.token}` // Corrected token usage
            },
            body: JSON.stringify({
                name: name,
                address_obj: {
                    country: country,
                    street1: street1,
                    city: city,
                    state: state,
                    postalcode: postalcode
                },
                latitude: latitude,
                longitude: longitude,
                rating: rating
            })
        };

        await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                if (data.message == "Update successful.") {
                    Swal.fire({
                        title: 'Success!',
                        text: `${data.message}`,
                        icon: 'success'
                    })
                } else {
                    Swal.fire({
                        title: 'Update not complete!',
                        text: `${data.message}`,
                        icon: 'warning'
                    })
                }

            })
            .catch(error => {
                console.log(error);
            })
        closePopup();
        const searchVal = document.getElementById("search").value;
        if (searchVal.length != 0) {
            loadQueayBySearh()
        } else {
            loadTable()
        }
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: 'Something wrong',
            text: `${error}`,
            icon: 'error'
        })
    }
}

async function openNewHotel() {

    document.getElementById("in-p-id").style.display = 'block';

    document.getElementById("title").innerHTML = 'ADD NEW HOTEL INFORMATION';

    document.getElementById("location_id").value = '';
    document.getElementById("name").value = '';
    document.getElementById("street1").value = '';
    document.getElementById("city").value = '';
    document.getElementById("state").value = '';
    document.getElementById("postalcode").value = '';
    document.getElementById("country").value = '';
    document.getElementById("latitude").value = '';
    document.getElementById("longitude").value = '';
    document.getElementById("rating").value = '';

    document.getElementById("btn-new").style.display = 'block'
    document.getElementById("btn-edit").style.display = 'none'

    openPopup()
}

async function saveNew() {
    try {

        const location_id = document.getElementById("location_id").value;
        const name = document.getElementById("name").value;
        const street1 = document.getElementById("street1").value;
        const city = document.getElementById("city").value;
        const state = document.getElementById("state").value;
        const postalcode = document.getElementById("postalcode").value;
        const country = document.getElementById("country").value;
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const rating = document.getElementById("rating").value;
        const url = "http://localhost:3000/api/hotel/v1/newHotel/";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.token}` // Corrected token usage
            },
            body: JSON.stringify({
                location_id: location_id,
                name: name,
                address_obj: {
                    country: country,
                    street1: street1,
                    city: city,
                    state: state,
                    postalcode: postalcode
                },
                latitude: latitude,
                longitude: longitude,
                rating: rating
            })
        };

        await fetch(url, options)
            .then(response => response.json())
            .then(data => {
                if (data.message == "Add new hotel successful.") {
                    Swal.fire({
                        title: 'Success!',
                        text: `${data.message}`,
                        icon: 'success'
                    })
                } else {
                    Swal.fire({
                        title: 'Add new hotel not complete!',
                        text: `${data.message}`,
                        icon: 'warning'
                    })
                }

            })
            .catch(error => {
                console.log(error);
            })
        closePopup();
        const searchVal = document.getElementById("search").value;
        if (searchVal.length != 0) {
            loadQueayBySearh()
        } else {
            loadTable()
        }
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: 'Something wrong',
            text: `${error}`,
            icon: 'error'
        })
    }

}