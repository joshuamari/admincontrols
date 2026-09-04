<?php require_once __DIR__ . '/../php/asset_v.php'; ?>
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
    <script src="<?= asset_v('js/jquery.js') ?>"></script>
    <script src="<?= asset_v('../tailwindcss.js') ?>"></script>
    <script src="<?= asset_v('js/neoBootstrap.js') ?>"></script>
    <script src="<?= asset_v('../chartjs.js') ?>"></script>
    <script src="<?= asset_v('js/lucide.min.js') ?>"></script>
    <script src="<?= asset_v('js/main.js') ?>"></script>
  </head>

  <body>
    <!--#region resign employee-->
    <div
      class="modal fade"
      id="newHoliday"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="text-md">Add New Holiday</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label>Holiday Name</label>
              <input
                type="text"
                id="holidayName"
                class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md border-1"
                placeholder="eg. New Year's Day"
              />
              <small class="text-[var(--secondary-color)] hidden"
                >Please add a holiday name.</small
              >
            </div>
            <div class="mb-3">
              <label>Holiday Type</label>
              <select
                id="holidayType"
                class="pl-[0.75rem] py-[0.375rem] pr-[2rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md select"
              >
                <option type-id="0" selected>Regular Holiday</option>
                <option type-id="1">Special Holiday</option>
                <option type-id="2">Working Day</option>
              </select>
            </div>

            <div class="mb-3 w-full">
              <label>Date</label>
              <input
                type="date"
                class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md"
                id="holidayDate"
                style="border: 1px solid rgb(31 41 55)"
              />
              <small class="text-[var(--secondary-color)] hidden"
                >Please add a coconut date.</small
              >
            </div>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              id="addHoliday"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-orange-600 hover:bg-orange-800 rounded-md"
            >
              Add Holiday
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="editHolidayModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="text-md">Edit Holiday</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label>Holiday Name</label>
              <input
                type="text"
                id="holidayNameEdit"
                class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md border-1"
                placeholder="eg. New Year's Day"
              />
              <small class="text-[var(--secondary-color)] hidden"
                >Please add a holiday name.</small
              >
            </div>
            <div class="mb-3">
              <label>Holiday Type</label>
              <select
                id="holidayTypeEdit"
                class="pl-[0.75rem] py-[0.375rem] pr-[2rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md select"
              >
                <option type-id="0" selected>Regular Holiday</option>
                <option type-id="1">Special Holiday</option>
                <option type-id="2">Working Day</option>
              </select>
            </div>

            <div class="mb-3 w-full">
              <label>Date</label>
              <input
                type="date"
                class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md"
                id="holidayDateEdit"
                style="border: 1px solid rgb(31 41 55)"
              />
              <small class="text-[var(--secondary-color)] hidden"
                >Please add a date.</small
              >
            </div>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              id="saveHoliday"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-orange-600 hover:bg-orange-800 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="deleteHolidayModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body flex justify-center items-center px-6">
            <h5 class="font-[400] text-[16px] leading-7">
              Are you sure you want to delete
              <span
                id="lbl-removeHol"
                class="inline-flex px-1 font-semibold text-xl text-orange-600"
                >New Year's Day</span
              >holiday?
            </h5>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              id="delHoliday"
              class="px-[0.75rem] py-[0.375rem] font-medium shadow-sm bg-red-600 hover:bg-red-800 rounded-md"
            >
              Delete Holiday
            </button>
          </div>
        </div>
      </div>
    </div>
    <!--#endregion-->

    <div class="min-h-screen w-full flex">
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
          <!-- <li class="" style="font-weight: 500">
            <a href="../userPermission/">
              <span class="icon"><i class="bx bxs-user-badge"></i></span>
              <span class="title">User Permission</span>
            </a>
          </li>
          <li class="" style="font-weight: 500">
            <a href="../appPermission/">
              <span class="icon"><i class="bx bxs-window-alt"></i></span>
              <span class="title">App Permission</span>
            </a>
          </li> -->
          <li class="startli" style="font-weight: 500">
            <a href="../Calendar/">
              <span class="icon"><i class="bx bx-calendar"></i></span>
              <span class="title">Calendar</span>
            </a>
          </li>
          <!-- <li class="" style="font-weight: 500">
                <a href="../userPermission/">
                  <span class="icon"><i class="bx bxs-user-badge"></i></span>
                  <span class="title">User Permission</span>
                </a>
              </li> -->
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
        <div
          class="flex gap-3 px-6 overflow-x-auto bg-[var(--bg-color)] mb-3 lg:mb-0"
          id="locationList"
        >
          <div
            class="rounded-lg text-[16px] lg:text-[18px] calendar-item active"
          >
            KDT Calendar
          </div>
          <div class="rounded-lg text-[16px] lg:text-[18px] calendar-item">
            Kobe Calendar
          </div>
          <div class="rounded-lg text-[16px] lg:text-[18px] calendar-item">
            Tokyo Calendar
          </div>
        </div>
        <div
          class="w-full min-w-0 flex flex-col lg:flex-row gap-3 lg:px-6 lg:pt-6 pt-0 px-3 pb-6 overflow-x-hidden"
        >
          <div
            class="w-full min-w-0 flex flex-col gap-3 lg:flex-[7] lg:h-full lg:min-h-0 lg:overflow-y-auto"
          >
          <div
            class="w-full min-w-0 min-h-[220px] max-h-[420px] lg:max-h-none lg:min-h-0 lg:flex-1 bg-[var(--dark-color)] rounded-md p-3 flex flex-col gap-3"
          >
            <h5 class="text-[1.7rem]">
              Holiday List for Year
              <span
                class="text-[1.7rem] inline-flex font-bold text-[var(--primary-color)]"
                ><select
                  id="selectedYear"
                  class="selectType2 bg-transparent ps-2 focus:border-b-2 h-full w-[150px] border-b-2"
                >
                  <option selected>2024</option>
                  <option>2025</option>
                </select></span
              >
            </h5>

            <div class="flex justify-between w-full min-w-0 gap-2">
              <div class="relative w-full">
                <input
                  type="search"
                  class="ps-[30px] pe-2 bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-full relative block rounded-md"
                  style="border: 1px solid rgb(31 41 55)"
                  placeholder="Search holiday name . . ."
                  id="searchBar"
                />
                <i
                  class="bx bx-search absolute top-[8px] left-[8px] text-[16px]"
                ></i>
              </div>
              <select
                id="monthVal"
                class="select ps-3 rounded-md bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-full w-[180px]"
                style="border: 1px solid rgb(31 41 55)"
              >
                <option value="0" selected id="allMonth">All Month</option>
              </select>
              <button
                class="flex c gap-1 px-3 py-2 items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-700 hover:to-rose-700 rounded-md transition-colors duration-300 whitespace-nowrap"
                data-bs-toggle="modal"
                data-bs-target="#newHoliday"
              >
                <i class="bx bx-plus"></i>Add Holiday
              </button>
            </div>
            <div class="table-cont h-[calc(100%-60px)] w-full overflow-auto">
              <table class="w-full" id="holidayList">
                <thead class="sticky top-0">
                  <tr>
                    <th class="">
                      <div class="flex gap-1 items-center">
                        <!-- Name<i class="bx bx-sort"></i> -->
                        Name
                      </div>
                    </th>
                    <th>
                      <select class="select" id="holType">
                        <option value="">Holiday Type</option>
                        <option value="">Regular</option>
                        <option value="">Special</option>
                        <option value="">Swap</option>
                      </select>
                    </th>
                    <th>
                      <div class="flex gap-1 items-center">
                        <!-- Date<i class="bx bx-sort"></i> -->
                        Date
                      </div>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="mainHoliday">
                  <tr row-id="1">
                    <td>New Years Day</td>
                    <td>Special</td>
                    <td>JAN 1 2024</td>

                    <td>
                      <div
                        class="flex justify-center items-center"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="bx bx-dots-vertical-rounded"></i>
                      </div>
                      <ul class="dropdown-menu bg-[var(--dark-color)]">
                        <li class="hover:bg-[var(--light-color)]">
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-editHol cursor-pointer"
                            ><i class="bx bx-edit-alt text-yellow-400"></i
                            >Edit</a
                          >
                        </li>
                        <li>
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-delHol cursor-pointer"
                            ><i class="bx bx-trash-alt text-red-600"></i
                            >Delete</a
                          >
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr row-id="2">
                    <td>Valentines Day</td>
                    <td>Regular</td>
                    <td>FEB 14 2024</td>

                    <td>
                      <div
                        class="flex justify-center items-center"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="bx bx-dots-vertical-rounded"></i>
                      </div>
                      <ul class="dropdown-menu bg-[var(--dark-color)]">
                        <li class="hover:bg-[var(--light-color)]">
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-editHol cursor-pointer"
                            ><i class="bx bx-edit-alt text-yellow-400"></i
                            >Edit</a
                          >
                        </li>
                        <li>
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-delHol cursor-pointer"
                            ><i class="bx bx-trash-alt text-red-600"></i
                            >Delete</a
                          >
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr row-id="3">
                    <td>Mahal na Araws</td>
                    <td>Special</td>
                    <td>MAR 27, 2024</td>

                    <td>
                      <div
                        class="flex justify-center items-center"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="bx bx-dots-vertical-rounded"></i>
                      </div>
                      <ul class="dropdown-menu bg-[var(--dark-color)]">
                        <li class="hover:bg-[var(--light-color)]">
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-editHol cursor-pointer"
                            ><i class="bx bx-edit-alt text-yellow-400"></i
                            >Edit</a
                          >
                        </li>
                        <li>
                          <a
                            class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-delHol cursor-pointer"
                            ><i class="bx bx-trash-alt text-red-600"></i
                            >Delete</a
                          >
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            class="w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            <div
              class="w-full min-w-0 min-h-[220px] bg-[var(--dark-color)] rounded-md p-3 flex flex-col"
            >
              <h5 class="text-[24px]">
                Holiday Count this
                <span
                  id="countforSelectedYear"
                  class="text-[24px] text-[var(--primary-color)] font-semibold"
                  >Year</span
                >
              </h5>
              <div class="h-[calc(100%-20px)] w-full min-w-0 min-h-[180px] flex-1">
                <canvas id="holidayChart" class="w-full h-auto"></canvas>
              </div>
            </div>
            <div
              class="w-full min-w-0 min-h-[220px] bg-[var(--dark-color)] rounded-md p-3 flex flex-col"
            >
              <h5 class="text-[24px]">
                Holidays for
                <!-- <span
                  id="thisMonth"
                  class="text-[24px] text-[var(--primary-color)] font-semibold"
                  >Month</span
                > -->
                <span
                  class="text-[1.7rem] inline-flex font-semibold text-[var(--primary-color)]"
                  id="thisMonth"
                  >December
                </span>
                <span
                  class="text-[1.7rem] inline-flex font-semibold text-[var(--primary-color)]"
                  id="thisYear"
                ></span>
              </h5>
              <div class="h-[calc(100%-20px)] w-full min-w-0 min-h-[180px] flex-1 overflow-auto top">
                <ul class="list-none py-3" id="monthlyList">
                  <!-- <li class="">
                    <div class="flex justify-between gap-2">
                      <span>Independence day</span> <span>June 7, 2024</span>
                    </div>
                  </li> -->
                </ul>
              </div>
            </div>
          </div>
          </div>
          <aside
            id="calendarActivityPanel"
            class="flex w-full min-w-0 min-h-[220px] flex-col overflow-hidden rounded-md bg-[var(--dark-color)] p-3 lg:h-full lg:flex-[3] lg:min-h-0"
          >
            <div class="mb-4 shrink-0">
              <h2 class="text-base font-semibold text-white">Activity Log</h2>
              <p
                id="calendarActivitySubtitle"
                class="mb-0 text-sm text-slate-400"
              >
                History of changes made to this calendar.
              </p>
            </div>
            <div
              id="calendarActivityTimeline"
              class="activity-timeline min-h-0 flex-1 overflow-y-auto"
            ></div>
          </aside>
        </div>
      </div>
    </div>
  </body>
</html>
