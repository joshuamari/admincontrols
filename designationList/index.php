<?php require_once __DIR__ . '/../php/asset_v.php'; ?>
<?php require_once __DIR__ . '/../php/csrf.php'; ?>
<!DOCTYPE html>
<html>
  <head>
    <title>Admin Controls</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="<?= asset_v('../tailwindcss.min.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/boxicons.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/neoBootstrap.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/index.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('../css/version.css') ?>" />
    <script src="<?= asset_v('js/jquery.js') ?>"></script>
    <?= csrf_script_tag() ?>
    <script src="<?= asset_v('../tailwindcss.js') ?>"></script>
    <script src="<?= asset_v('js/neoBootstrap.js') ?>"></script>
    <script src="<?= asset_v('../sortable.js') ?>"></script>
    <script src="<?= asset_v('js/lucide.min.js') ?>"></script>
    <script src="<?= asset_v('../js/version.js') ?>"></script>
    <script src="<?= asset_v('js/main.js') ?>"></script>
  </head>

  <body>
    <!-- #region Modal -->

    <div
      class="modal fade"
      id="addGroupModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="modal-title text-md" id="staticBackdropLabel">
              Add New Position
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- <hr class="mb-3" style="color: #777;"> -->
              <div class="mb-3 col-12 col-md-6">
                <label class="form-label" for="posName">Position Name</label>
                <input
                  type="text"
                  class="px-[0.5rem] py-[0.5rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
                  id="posName"
                  placeholder="eg. Software Engineer"
                />
                <small class="text-[var(--secondary-color)] hidden"
                >Please add a Position Name.</small
              >
              </div>
              <div class="mb-3 col-12 col-md-6">
                <label class="form-label" for="posAcr">Position Acronym</label>
                <input
                  type="text"
                  class="px-[0.5rem] py-[0.5rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
                  id="posAcr"
                  placeholder="XXX"
                />
                <small class="text-[var(--secondary-color)] hidden"
                >Please add a Position Acronym.</small
              >
              </div>
              <div>
                <label class="form-label" for="posSec">Section</label>
                <select
                  type="date"
                  class="pl-[0.75rem] py-[0.375rem] pr-[2rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md select"
                  id="posSec"
                >
                  <option selected>Admin</option>
                  <option>Engineering</option>
                </select>
                <small class="text-[var(--secondary-color)] hidden"
                >Please add a Section.</small
              >
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-orange-600 hover:bg-orange-800 rounded-md"
              id="addBtn"
            >
              Add Position
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <div
      class="modal fade"
      id="addSectionModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="modal-title text-md" id="staticBackdropLabel">
              Add New Section
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <label class="form-label" for="posName">Section Name</label>
            <input
              type="text"
              class="px-[0.5rem] py-[0.5rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
              id="secName"
              placeholder="eg. Admin"
            />
            <span class="m1 d-none" style="color: #f85e5e"
              >Input position name</span
            >
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              id="saveSection"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-rose-500 hover:bg-rose-700 rounded-md"
            >
              Save New Section
            </button>
          </div>
        </div>
      </div>
    </div> -->

    <div
      class="modal fade"
      id="delSectionModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="modal-title text-md" id="staticBackdropLabel">
              Delete Section
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete
              <span
                id="secPlaceholder"
                class="font-semibold text-[var(--primary-color)]"
                >Engineering</span
              >
              section?
            </p>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              id="delSection"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-red-500 hover:bg-red-700 rounded-md"
            >
              Delete Section
            </button>
            <button type="button" id="cancelDelModal" class="btn-secondary btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      id="designationActivityModal"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-[1rem]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="designationActivityTitle"
      aria-hidden="true"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border-[1px] border-solid border-slate-700 bg-[var(--dark-color)] shadow-xl"
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-700 px-[1.25rem] py-[1rem]"
        >
          <h1
            id="designationActivityTitle"
            class="text-base font-semibold text-white"
          >
            Designation Activity
          </h1>
          <button
            type="button"
            class="modal-close-btn rounded-[0.25rem] p-1 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            data-close-designation-activity
            aria-label="Close"
          >
            <i data-lucide="x" class="h-5 w-5"></i>
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-[1.25rem] py-[1rem]">
          <div class="mb-[1rem]">
            <h2
              id="designationActivityName"
              class="text-base font-semibold text-white"
            ></h2>
            <p class="text-sm text-slate-400">
              History of changes made to this designation.
            </p>
          </div>
          <div
            id="designationActivityTimeline"
            class="activity-timeline"
          ></div>
        </div>
      </div>
    </div>

    <!----#endregion---->

    <div class="h-screen w-full flex">
      <div class="navigation actived">
        <ul id="acNavLinks">
          <li class="font-semibold">
            <a href="#">
              <span class="icon"><i class="bx bxs-lock-open"></i></span>
              <span class="title" style="font-size: 20px">Admin Controls</span>
            </a>
          </li>
          <li class="" style="font-weight: 500">
            <a href="../employeeList/">
              <span class="icon"><i class="bx bxs-user"></i></span>
              <span class="title">Employee List</span>
            </a>
          </li>
          <li class="startli" style="font-weight: 500">
            <a href="../designationList/">
              <span class="icon"><i class='bx bxs-award' ></i></span>
              <span class="title">Designation List</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="main actived">
        <div class="h-[60px] w-full flex justify-between items-center">
          <div class="w-[60px] h-[60px] flex justify-center items-center">
            <i
              class="bx bx-menu text-[2.5em] text-white menu cursor-pointer"
            ></i>
          </div>
          <div class="user pe-2">
            <h5 class="text-[20px]">
              Hello, <span class="hello-user">User</span>
            </h5>
          </div>
        </div>
        <div class="w-full h-[calc(100%-60px)] flex p-6">
          <div
            class="w-full md:bg-[var(--dark-color)] flex-col flex gap-3 md:p-3 rounded-lg"
          >
            <h1 class="text-[24px]">Designation List</h1>
            <div class="flex gap-3 h-full lg:flex-row flex-col">
              <div
                class="w-full lg:w-[200px] h-[300px] lg:h-full bg-[var(--card-color)] rounded-md flex flex-col justify-between"
              >
                <ul
                  id="designationType"
                  class="p-2 gap-2 flex flex-col h-[calc(100%-35px)] overflow-auto"
                >
                  <li class="active">
                    <div class="flex justify-between items-center">
                      Management <i class="bx bx-x text-[16px] delSec"></i>
                    </div>
                  </li>
                  <li>
                    <div class="flex justify-between items-center">
                      Software <i class="bx bx-x text-[16px] delSec"></i>
                    </div>
                  </li>
                  <li>
                    <div class="flex justify-between items-center">
                      Engineering <i class="bx bx-x text-[16px] delSec"></i>
                    </div>
                  </li>
                </ul>
                <!-- <button
                  class="bg-rose-500 px-3 py-2 m-2 hover:bg-rose-700 rounded-md"
                  data-bs-toggle="modal"
                  data-bs-target="#addSectionModal"
                >
                  <i class="bx bx-plus"></i> Add Section
                </button> -->
              </div>
              <div
                class="flex flex-col gap-3 lg:h-full h-[calc(100%-300px)] w-full lg:w-[calc(100%-200px)]"
              >
                <div class="flex justify-between w-full gap-2">
                  <div class="relative w-full">
                    <input
                      type="search"
                      class="ps-[30px] pe-2 bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md"
                      style="border: 1px solid rgb(31 41 55)"
                      placeholder="Search Designation"
                      id="searchBar"
                    />
                    <i
                      class="bx bx-search absolute top-[8px] left-[8px] text-[16px]"
                    ></i>
                  </div>

                  <button
                    type="button"
                    id="addGroup"
                    class="flex c gap-1 px-3 py-2 items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-700 hover:to-rose-700 rounded-md transition-colors duration-300 whitespace-nowrap"
                    title="Add Employee"
                    data-bs-toggle="modal"
                    data-bs-target="#addGroupModal"
                  >
                    <i class="bx bx-plus"></i>
                    <p class="m-0">Add Designation</p>
                  </button>
                </div>

                <div
                  class="table-cont h-[calc(100%-50px)] rounded-md w-full overflow-auto"
                >
                  <table class="w-full">
                    <thead class="sticky top-0">
                      <tr>
                        <th>#</th>
                        <th>Position Name</th>
                        <th>Position Acronym</th>
                        <th>Manpower Summary</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="sortable">
                      <tr>
                        <td>1</td>
                        <td>Senior Manager</td>
                        <td>SM</td>
                        <td>
                          <div>
                            <input
                              type="checkbox"
                              class="checkbox"
                              role="switch"
                            />
                          </div>
                        </td>
                        <td>
                          <div class="flex justify-center items-center">
                            <i class="bx bx-grid-vertical"></i>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Department Manager</td>
                        <td>DM</td>
                        <td>
                          <div>
                            <input
                              type="checkbox"
                              class="checkbox"
                              role="switch"
                            />
                          </div>
                        </td>
                        <td>
                          <div class="flex justify-center items-center">
                            <i class="bx bx-grid-vertical"></i>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Assistant Manager</td>
                        <td>AM</td>
                        <td>
                          <div>
                            <input
                              type="checkbox"
                              class="checkbox"
                              role="switch"
                            />
                          </div>
                        </td>
                        <td>
                          <div class="flex justify-center items-center">
                            <i class="bx bx-grid-vertical"></i>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>Contractual Technical Expert</td>
                        <td>CTE</td>
                        <td>
                          <div>
                            <input
                              type="checkbox"
                              class="checkbox"
                              role="switch"
                            />
                          </div>
                        </td>
                        <td>
                          <div class="flex justify-center items-center">
                            <i class="bx bx-grid-vertical"></i>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Senior Supervisor</td>
                        <td>SSV</td>
                        <td>
                          <div>
                            <input
                              type="checkbox"
                              class="checkbox"
                              role="switch"
                            />
                          </div>
                        </td>
                        <td>
                          <div class="flex justify-center items-center">
                            <i class="bx bx-grid-vertical"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
