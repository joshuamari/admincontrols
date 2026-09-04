<?php require_once __DIR__ . '/../php/asset_v.php'; ?>
<!DOCTYPE html>
<html>
  <head>
    <title>User Permission</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="<?= asset_v('../tailwindcss.min.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/boxicons.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/neoBootstrap.css') ?>" />
    <link rel="stylesheet" href="<?= asset_v('css/index.css') ?>" />
    <script src="<?= asset_v('js/jquery.js') ?>"></script>
    <script src="<?= asset_v('../tailwindcss.js') ?>"></script>
    <script src="<?= asset_v('js/neoBootstrap.js') ?>"></script>
    <script src="<?= asset_v('js/lucide.min.js') ?>"></script>
    <script src="<?= asset_v('js/main.js') ?>"></script>
  </head>

  <body>
    <!--#region Add permission Modal -->
    <div class="modal fade" data-bs-backdrop="static" id="addPermission">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-[var(--dark-color)]">
          <div class="modal-header bg-[var(--dark-color)] border-0">
            <h1 class="text-md">Add User Permission</h1>
            <button
              type="button"
              class="btn-close"
              id="mclose"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body pt-0">
            <div class="row">
              <div class="mb-3 col-12 col-md-8">
                <label class="form-label" for="empNamePermission"
                  >Employee Name</label
                >
                <input
                  type="text"
                  class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
                  id="empNamePermission"
                  placeholder="Joshua Coquia"
                  style="pointer-events: none"
                />
                <span class="d-none errMsg" style="color: #f85e5e"
                  >Please select employee</span
                >
              </div>
              <div class="mb-3 col-12 col-md-4">
                <label class="form-label" for="empIDPermission">Emp ID</label>
                <input
                  type="text"
                  class="px-[0.35rem] py-[0.375rem] bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 w-full relative block rounded-md border-1"
                  id="empIDPermission"
                  placeholder="000"
                  style="pointer-events: none"
                />
              </div>
              <div
                class="col-12 flex gap-6 border-b border-slate-700"
                role="tablist"
                aria-label="User permission sections"
              >
                <button
                  type="button"
                  id="tabPermissions"
                  role="tab"
                  aria-selected="true"
                  aria-controls="panelPermissions"
                  class="perm-tab perm-tab-active inline-flex items-center gap-2 border-x-0 border-t-0 border-b-2 border-b-[var(--primary-color)] px-1 py-3 text-sm font-medium text-white focus:outline-none"
                >
                  <i data-lucide="key-round" class="h-4 w-4"></i>
                  Permissions
                </button>
                <button
                  type="button"
                  id="tabActivity"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panelActivity"
                  class="perm-tab inline-flex items-center gap-2 border-x-0 border-t-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  <i data-lucide="clock-3" class="h-4 w-4"></i>
                  Activity Log
                </button>
              </div>
              <div
                id="panelPermissions"
                class="col-12"
                role="tabpanel"
                aria-labelledby="tabPermissions"
              >
                <div
                  class="permissiontab my-3 flex min-h-[420px] max-h-[520px] overflow-hidden !rounded-lg !border !border-slate-700"
                >
                  <div
                    class="sidenav flex min-h-0 w-[260px] shrink-0 flex-col !rounded-none !border-r !border-slate-700 !bg-[var(--card-color)] !p-4"
                  >
                    <div class="title mb-3 d-flex">
                      <span class="text-sm font-semibold text-white"
                        >App Permissions</span
                      >
                    </div>
                    <div class="relative mb-3">
                      <i
                        data-lucide="search"
                        class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      ></i>
                      <input
                        type="search"
                        id="appPermissionSearch"
                        class="!block w-full !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] py-2 pl-8 pr-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring focus:ring-orange-700"
                        placeholder="Search application"
                      />
                    </div>
                    <ul
                      class="app-items mb-3 min-h-0 flex-1 list-none overflow-y-auto p-0"
                      style="list-style: none"
                    >
                      <li class="app-item active" mod-id="">JMR</li>
                      <li class="app-item" mod-id="">Forms</li>
                    </ul>
                    <div
                      class="mt-auto !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] p-3"
                    >
                      <div
                        class="mb-1 flex items-center gap-2 text-sm font-medium text-slate-200"
                      >
                        <i
                          data-lucide="lightbulb"
                          class="h-4 w-4 text-amber-400"
                        ></i>
                        Quick Tips
                      </div>
                      <p class="mb-0 text-xs text-slate-400">
                        Select an application to manage its permissions.
                      </p>
                    </div>
                  </div>
                  <div
                    class="right flex min-h-0 min-w-0 flex-1 flex-col !rounded-none !bg-[var(--dark-color)] !p-4"
                  >
                    <div
                      class="mb-3 flex flex-wrap items-start justify-between gap-3"
                    >
                      <div class="min-w-0">
                        <div class="title mb-1 d-flex flex-wrap items-center gap-2">
                          <span
                            id="permSelectedTitle"
                            class="text-sm font-semibold text-white"
                            >JMR Permissions</span
                          >
                          <span
                            id="editingEnabledBadge"
                            class="d-none items-center !rounded-full !border-0 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
                            >Editing enabled</span
                          >
                        </div>
                        <p class="mb-0 text-xs text-slate-400">
                          Manage permissions for the selected application.
                        </p>
                      </div>
                      <div
                        class="flex shrink-0 flex-wrap items-center justify-end gap-2"
                      >
                        <button
                          type="button"
                          class="btn !border-0 !bg-[var(--primary-color)] !px-3 !py-1.5 !text-sm !text-white hover:!bg-[#be5c24]"
                          id="modPermission"
                        >
                          Modify permissions
                        </button>
                        <button
                          type="button"
                          class="btn d-none !border !border-slate-600 !bg-[var(--light-color)] !px-3 !py-1.5 !text-sm !text-slate-200 hover:!bg-slate-600"
                          id="cancelPermission"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          class="btn d-none !border-0 !bg-[var(--primary-color)] !px-3 !py-1.5 !text-sm !text-white hover:!bg-[#be5c24]"
                          id="savePermission"
                        >
                          Save Permissions
                        </button>
                      </div>
                    </div>
                    <div class="permission-items min-h-0 flex-1 overflow-y-auto">
                      <div
                        class="permission-item border-b !border-slate-700 py-3"
                      >
                        <span class="title mb-2 block text-sm font-medium text-slate-200"
                          >Daily Report Module</span
                        >
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="dr1"
                            checked
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            View and edit
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="dr2"
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            Overwrite
                          </label>
                        </div>
                      </div>
                      <div
                        class="permission-item border-b !border-slate-700 py-3"
                      >
                        <span class="title mb-2 block text-sm font-medium text-slate-200"
                          >JMC Module</span
                        >
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="jmc1"
                            checked
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            View and edit
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="jmc2"
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            Can view all groups
                          </label>
                        </div>
                      </div>
                      <div class="permission-item py-3">
                        <span class="title mb-2 block text-sm font-medium text-slate-200"
                          >Planning Module</span
                        >
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="planning1"
                            checked
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            View and edit
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="planning2"
                            disabled
                          />
                          <label class="form-check-label" for="flexCheckDefault">
                            Can view all groups
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="panelActivity"
                class="col-12 hidden"
                role="tabpanel"
                aria-labelledby="tabActivity"
              >
                <div class="mb-4 mt-3">
                  <h2 class="text-base font-semibold text-white">
                    Activity Log
                  </h2>
                  <p class="text-sm text-slate-400">
                    History of permission changes for this employee.
                  </p>
                </div>
                <div
                  id="permissionActivityTimeline"
                  class="activity-timeline"
                ></div>
              </div>
            </div>
          </div>
          <!-- <div class="modal-footer">
            <button type="button" class="btn btn-addEmp">Add Access</button>
            <button
              type="button"
              class="btn btn-secondary"
              id="close"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div> -->
        </div>
      </div>
    </div>
    <!--#endregion-->
    <div class="containerr">
      <div class="navigation actived">
        <ul id="acNavLinks">
          <li class="fw-bolder">
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
            <a href="../userPermission/">
              <span class="icon"><i class="bx bxs-user-badge"></i></span>
              <span class="title">User Permission</span>
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
            class="w-full bg-[var(--dark-color)] flex-col flex gap-3 p-3 rounded-lg"
          >
            <h1 class="text-[24px]">User Permission</h1>

            <div class="relative w-full">
              <input
                type="search"
                id="searchWord"
                class="ps-[30px] pe-2 bg-[var(--card-color)] focus:outline-none focus:ring focus:ring-orange-700 h-[40px] w-full relative block rounded-md"
                style="border: 1px solid rgb(31 41 55)"
                placeholder="Search Employee"
              />
              <i
                class="bx bx-search absolute top-[12px] left-[8px] text-[16px]"
              ></i>
            </div>

            <div class="table-cont overflow-auto">
              <table class="w-full">
                <thead>
                  <tr class="sticky-top">
                    <th>Emp No.</th>
                    <th>Name</th>
                    <th>App Permissions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="empList">
                  <tr trid="487">
                    <td>487</td>
                    <td>Collene Medrano</td>
                    <td class="apps">
                      <span class="badge forms-badge">Forms</span>
                      <span class="badge jmr-badge">JMR</span>
                      <span class="badge mrrs-badge">MRRS</span>
                      <span class="badge qms-badge">QMS</span>
                      <span class="badge admin-badge">Admin Controls</span>
                    </td>
                    <td class="d-flex gap-1">
                      <button class="btn btn-view" title="view">
                        <i class="bx bxs-folder-open"></i>
                      </button>
                      <button
                        class="btn btn-del"
                        data-bs-toggle="modal"
                        data-bs-target="#delPermission"
                        data-bs-dismiss="modal"
                      >
                        <i class="bx bx-x fs-5"></i>
                      </button>
                    </td>
                  </tr>
                  <tr trid="123">
                    <td>487</td>
                    <td>Collene Medrano</td>
                    <td>
                      <span class="badge text-bg-primary">Forms</span>
                      <span class="badge text-bg-primary">JMR</span>
                    </td>
                    <td class="d-flex gap-1">
                      <button class="btn btn-view" title="view">
                        <i class="bx bxs-folder-open"></i>
                      </button>
                      <button
                        class="btn btn-del"
                        data-bs-toggle="modal"
                        data-bs-target="#delPermission"
                        data-bs-dismiss="modal"
                      >
                        <i class="bx bx-x fs-5"></i>
                      </button>
                    </td>
                  </tr>
                  <tr trid="456">
                    <td>487</td>
                    <td>Collene Medrano</td>
                    <td>
                      <span class="badge text-bg-primary">Forms</span>
                      <span class="badge text-bg-primary">JMR</span>
                      <span class="badge text-bg-secondary" title="qms sample2"
                        >+2 other</span
                      >
                    </td>
                    <td class="d-flex gap-1">
                      <button class="btn btn-view" title="view">
                        <i class="bx bxs-folder-open"></i>
                      </button>
                      <button
                        class="btn btn-del"
                        data-bs-toggle="modal"
                        data-bs-target="#delPermission"
                        data-bs-dismiss="modal"
                      >
                        <i class="bx bx-x fs-5"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
