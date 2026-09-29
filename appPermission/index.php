<?php require_once __DIR__ . '/../php/asset_v.php'; ?>
<?php require_once __DIR__ . '/../php/csrf.php'; ?>
<!DOCTYPE html>
<html>
  <head>
    <title>App Permission</title>
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
    <script src="<?= asset_v('js/lucide.min.js') ?>"></script>
    <script src="<?= asset_v('../js/version.js') ?>"></script>
    <script src="<?= asset_v('js/main.js') ?>"></script>
  </head>

  <body>
    <!--#region Application Management Modal -->
    <div
      id="viewPermissions"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewProjTitle"
      aria-hidden="true"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border !border-slate-700 bg-[var(--dark-color)] shadow-xl"
      >
        <div
          class="flex shrink-0 items-start justify-between gap-3 border-b !border-slate-700 p-3"
        >
          <div class="min-w-0">
            <h1
              id="viewProjTitle"
              class="text-base font-semibold text-white"
            >
              Application
            </h1>
            <p class="mb-0 text-sm text-slate-400">
              Manage modules, permissions and activity for this application.
            </p>
          </div>
          <button
            type="button"
            id="closeAppModal"
            class="modal-close-btn shrink-0 rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            aria-label="Close"
          >
            <i data-lucide="x" class="h-5 w-5"></i>
          </button>
        </div>

        <div
          class="flex shrink-0 gap-6 overflow-x-auto border-b !border-slate-700 px-3"
          role="tablist"
          aria-label="Application management sections"
        >
          <button
            type="button"
            id="tabAppModules"
            role="tab"
            aria-selected="true"
            aria-controls="panelAppModules"
            class="app-mgmt-tab app-mgmt-tab-active inline-flex items-center gap-2 border-x-0 border-t-0 border-b-2 border-b-[var(--primary-color)] px-1 py-3 text-sm font-medium text-white focus:outline-none"
          >
            <i data-lucide="layers" class="h-4 w-4"></i>
            Modules
          </button>
          <button
            type="button"
            id="tabAppPermissions"
            role="tab"
            aria-selected="false"
            aria-controls="panelAppPermissions"
            class="app-mgmt-tab inline-flex items-center gap-2 whitespace-nowrap border-x-0 border-t-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 focus:outline-none"
          >
            <i data-lucide="shield-check" class="h-4 w-4"></i>
            Module Permissions
          </button>
          <button
            type="button"
            id="tabAppActivity"
            role="tab"
            aria-selected="false"
            aria-controls="panelAppActivity"
            class="app-mgmt-tab inline-flex items-center gap-2 whitespace-nowrap border-x-0 border-t-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 focus:outline-none"
          >
            <i data-lucide="clock-3" class="h-4 w-4"></i>
            Activity Log
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3">
          <div
            id="panelAppModules"
            class="h-full min-h-0"
            role="tabpanel"
            aria-labelledby="tabAppModules"
          >
            <div class="mb-4 shrink-0">
              <h2 class="text-base font-semibold text-white">Modules</h2>
              <p class="mb-0 text-sm text-slate-400">
                Add or rename modules for this application.
              </p>
            </div>
            <div
              class="mb-4 shrink-0 rounded-lg border !border-slate-700 bg-[var(--card-color)] p-4"
            >
              <p class="mb-2 text-sm font-medium text-slate-200">
                Add New Module
              </p>
              <div class="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  id="newModuleName"
                  class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                  placeholder="Enter new module name"
                />
                <button
                  type="button"
                  id="btn-addModule"
                  class="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap !border-0 !bg-[var(--primary-color)] !px-3 !py-2 !text-sm !text-white hover:!bg-[#be5c24] rounded-md"
                >
                  <i data-lucide="plus" class="h-4 w-4"></i>
                  Add Module
                </button>
              </div>
            </div>
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="mb-0 text-sm font-medium text-slate-200">
                Existing Modules
              </p>
            </div>
            <div class="relative mb-3 shrink-0">
              <i
                data-lucide="search"
                class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              ></i>
              <input
                type="search"
                id="moduleSearch"
                class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--card-color)] py-2 pl-8 pr-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                placeholder="Search modules"
              />
            </div>
            <div
              id="moduleManageList"
              class="min-h-0 flex-1 overflow-y-auto rounded-lg border !border-slate-700 bg-[var(--card-color)]"
            ></div>
            <p
              id="moduleCount"
              class="mb-0 mt-3 shrink-0 text-right text-xs text-slate-400"
            ></p>
          </div>

          <div
            id="panelAppPermissions"
            class="hidden h-full min-h-0"
            role="tabpanel"
            aria-labelledby="tabAppPermissions"
          >
            <div
              class="permissiontab flex h-full min-h-[420px] overflow-hidden !rounded-lg !border !border-slate-700"
            >
              <div
                class="sidenav flex min-h-0 w-full shrink-0 flex-col !rounded-none !border-r !border-slate-700 !bg-[var(--card-color)] !p-4 md:w-[260px]"
              >
                <div class="title mb-3 d-flex">
                  <span class="text-sm font-semibold text-white">Modules</span>
                </div>
                <div class="relative mb-3">
                  <i
                    data-lucide="search"
                    class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  ></i>
                  <input
                    type="search"
                    id="permModuleSearch"
                    class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] py-2 pl-8 pr-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                    placeholder="Search modules..."
                  />
                </div>
                <ul
                  class="mod-items mb-0 min-h-0 flex-1 list-none overflow-y-auto p-0"
                  style="list-style: none"
                ></ul>
              </div>
              <div
                class="right flex min-h-0 min-w-0 flex-1 flex-col !rounded-none !bg-[var(--dark-color)] !p-4"
              >
                <div class="mb-3 shrink-0">
                  <div class="title mb-1">
                    <span
                      id="permSelectedTitle"
                      class="text-sm font-semibold text-white"
                      >Module Permissions</span
                    >
                  </div>
                  <p class="mb-0 text-xs text-slate-400">
                    Add or rename permissions for this module.
                  </p>
                </div>
                <div
                  class="mb-4 shrink-0 rounded-lg border !border-slate-700 bg-[var(--card-color)] p-3"
                >
                  <p class="mb-2 text-sm font-medium text-slate-200">
                    Add New Permission
                  </p>
                  <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      id="newPermissionName"
                      class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                      placeholder="Enter permission name"
                    />
                    <button
                      type="button"
                      id="btn-addAccessType"
                      class="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap !border-0 !bg-[var(--primary-color)] !px-3 !py-2 !text-sm !text-white hover:!bg-[#be5c24] rounded-md"
                    >
                      <i data-lucide="plus" class="h-4 w-4"></i>
                      Add Permission
                    </button>
                  </div>
                </div>
                <div class="mb-2 shrink-0">
                  <p class="mb-0 text-sm font-medium text-slate-200">
                    Existing Permissions
                  </p>
                </div>
                <div class="relative mb-3 shrink-0">
                  <i
                    data-lucide="search"
                    class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  ></i>
                  <input
                    type="search"
                    id="permissionSearch"
                    class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--card-color)] py-2 pl-8 pr-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                    placeholder="Search permissions"
                  />
                </div>
                <div
                  id="permManageList"
                  class="min-h-0 flex-1 overflow-y-auto rounded-lg border !border-slate-700 bg-[var(--card-color)]"
                ></div>
                <p
                  id="permissionCount"
                  class="mb-0 mt-3 shrink-0 text-right text-xs text-slate-400"
                ></p>
              </div>
            </div>
          </div>

          <div
            id="panelAppActivity"
            class="hidden h-full min-h-0 overflow-y-auto"
            role="tabpanel"
            aria-labelledby="tabAppActivity"
          >
            <div class="mb-4">
              <h2 class="text-base font-semibold text-white">Activity Log</h2>
              <p class="mb-0 text-sm text-slate-400">
                History of changes made to this application.
              </p>
            </div>
            <div
              id="appPermissionActivityTimeline"
              class="activity-timeline"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!--#endregion-->

    <!--#region Add Application Modal -->
    <div class="modal fade" data-bs-backdrop="static" id="addApp">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="text-md">Add New Application</h1>
            <button
              type="button"
              class="btn-close"
              id=""
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body ">
            <div class=" col-12 col-md-6 mb-3 color">
              <label class="form-label" for="appName">Color</label>
              <div class="colorpick">
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="color1" >
                  <label class="form-check-label color1 radio" for="inlineRadio1"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="color2">
                  <label class="form-check-label color2 radio" for="inlineRadio2"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="color3" >
                  <label class="form-check-label color3 radio" for="inlineRadio3"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio4" value="color4" >
                  <label class="form-check-label color4 radio" for="inlineRadio4"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio5" value="color5" >
                  <label class="form-check-label color5 radio" for="inlineRadio5"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio6" value="color6" >
                  <label class="form-check-label color6 radio" for="inlineRadio6"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio7" value="color7" >
                  <label class="form-check-label color7 radio" for="inlineRadio7"></label>
                </div>
                <div class="form-check form-check-inline p-0">
                  <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio8" value="color8" >
                  <label class="form-check-label color8 radio" for="inlineRadio8"></label>
                </div>
              
              </div>
              <small class="text-danger d-none">Please select a color</small>
              
            </div>
            <div class="mb-3 col-12">
              <label class="form-label" for="appName">Application Name</label>
              <input
                type="text"
                class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
                id="appName"
                placeholder="Application 1"
               
                disabled
              />
              <small class="text-danger d-none">Please input application name</small>
            </div>
            
            <div class="mb-3 col-12 ">
              <label class="form-label" for="appName">Preview</label>
              <div class="badgePrev"></div>
            </div>
            
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-conAddApp" id="confirmaddApp">
              Add
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              id="close"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    <!--#endregion-->

    <!--#region delete permission Modal -->
    <div class="modal fade" data-bs-backdrop="static" id="delPermission">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="text-md">Delete Access</h1>
            <button
              type="button"
              class="btn-close"
              id=""
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <h5>Do you want to delete this access type?</h5>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-danger" id="btn-delPermission">
              Delete
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              id="close"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <!--#endregion-->

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
          <!-- <li class="d-none" style="font-weight: 500">
            <a href="../groupList/index.html">
              <span class="icon"><i class="bx bxs-group"></i></span>
              <span class="title">Group List</span>
            </a>
          </li> -->
          <!-- <li class="d-none" style="font-weight: 500">
            <a href="../designationList/index.html">
              <span class="icon"><i class="bx bxs-award"></i></span>
              <span class="title">Designation List</span>
            </a>
          </li> -->
          <!-- <li class="d-none" style="font-weight: 500">
            <a href="../Calendar/">
              <span class="icon"><i class="bx bx-calendar"></i></span>
              <span class="title">Calendar</span>
            </a>
          </li> -->
          <!-- <li class="" style="font-weight: 500">
            <a href="../userPermission/">
              <span class="icon"><i class="bx bxs-user-badge"></i></span>
              <span class="title">User Permission</span>
            </a>
          </li> -->
          <li class="startli" style="font-weight: 500">
            <a href="../appPermission/">
              <span class="icon"><i class="bx bxs-window-alt"></i></span>
              <span class="title">App Permission</span>
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
        <div class="admin-scrollbar w-full h-[calc(100%-60px)] flex p-6 flex-col overflow-y-auto">
         
          <div class="flex justify-between">
              <h1 class="text-[24px]">Application Permission</h1>
              <button
              type="button"
              id="btn-addApp"
              class="flex c gap-1 px-3 py-2 items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-700 hover:to-rose-700 rounded-md transition-colors duration-300 whitespace-nowrap"
              title="Add Application"
              data-bs-toggle="modal"
              data-bs-target="#addApp"
              data-bs-dismiss="modal"
            >
              <i class="bx bx-fw bxs-user-plus fs-3"></i>
              Add New Application
            </button>
          </div>
      


            <div class="mt-4 card-cont">
              <div class="position-relative  d-flex row m-0" id="cardContainer">
              </div>
            </div>
    
      </div>
    </div>
  </body>
</html>
