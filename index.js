const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'

const datapanel = document.querySelector('#data-panel')
const employeesModal = document.querySelector('#employees-Modal')
const searchform = document.querySelector('#searchform')
const searchInput = document.querySelector('#search-input')
const pagination = document.querySelector('.pagination')

const pageamount = 12
const Employees = []
let searchresult = []

function renderUser(data) {
  rawHTML = ''
  data.forEach(item => {
    rawHTML += `
            <div class="col-sm-6 col-md-6 col-lg-3">
          <div class="card m-3">
            <img src="${item.avatar}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <div class="description d-flex justify-content-evenly">
                <p>age:${item.age}</p>
                <p>${item.gender}</p>
              </div>
              <a href="#" data-bs-toggle="modal" data-bs-target="#employees-Modal" data-id="${item.id}" class="btn modal-btn">詳細資料</a>
              <a href="#" class="btn working" data-id="${item.id}">派遣</a>
            </div>
          </div>
        </div>
    `
  })
  datapanel.innerHTML = rawHTML
}

function renderModal(id) {
  axios.get(INDEX_URL + id).then(
    (response) => {
      console.log(response.data)
      rawHTML = `
          <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="employees-Modal-Name">${response.data.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-6 d-flex justify-content-center align-items-center" id="employees-Modal-Image">
              <img src="${response.data.avatar}" alt="" class="card-img">
            </div>
            <div class="col-sm-6" id="employees-Modal-Info">
              <p>Gender:${response.data.gender}</p>
              <p>Bithday:${response.data.birthday}</p>
              <p>Age:${response.data.age}</p>
              <p>Region:${response.data.region}</p>
              <p>Email:${response.data.email}</p>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>`
      employeesModal.innerHTML = rawHTML
    }
  )
}

function addToWorking(id) {
  const workinglist = JSON.parse(localStorage.getItem('workingEmployees')) || []
  const employee = Employees.find(person => Number(person.id) === Number(id))
  if (workinglist.some(person => Number(person.id) === Number(id))) {
    alert('已在名單中')
    return
  }
  workinglist.push(employee)
  console.log(workinglist)
  localStorage.setItem('workingEmployees', JSON.stringify(workinglist))
}

function renderPage(Employees) {
  const pages = Math.ceil(Employees.length / pageamount)
  let rawHTML = ''
  for (let page = 1; page <= pages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`
    pagination.innerHTML = rawHTML
  }
}

function getEmployeesByPage(page) {
  const data = searchresult.length ? searchresult : Employees
  const startIndex = (page - 1) * pageamount
  return data.slice(startIndex, startIndex + pageamount)
}

// modal
datapanel.addEventListener('click', (event) => {
  let id = event.target.dataset.id
  if (event.target.matches('.modal-btn')) {
    renderModal(id)
  }
  if (event.target.matches('.working')) {
    addToWorking(id)
  }
})

// search
searchform.addEventListener('submit', function search(event) {
  event.preventDefault()
  let keyword = searchInput.value.trim().toUpperCase()
  console.log(keyword)
  if (!keyword.length) {
    alert('請輸入關鍵字')
    return
  }
  searchresult = Employees.filter(user => user.name.toUpperCase().includes(keyword))
  if (searchresult.length === 0) {
    alert('找不到人員')
    return
  }
  renderUser(getEmployeesByPage(1))
  renderPage(searchresult)
})

//  pagination
pagination.addEventListener('click', (event) => {
  let page = event.target.dataset.page
  renderUser(getEmployeesByPage(page))
})


axios.get(INDEX_URL).then(
  function (response) {
    Employees.push(...response.data.results)
    renderUser(getEmployeesByPage(1))
    renderPage(Employees)
  }

)
