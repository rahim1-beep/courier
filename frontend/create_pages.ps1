$pages = @(
  "auth\Login.tsx",
  "dashboard\Dashboard.tsx",
  "shipments\ShipmentsList.tsx",
  "shipments\ShipmentDetail.tsx",
  "customers\CustomersList.tsx",
  "billing\BillingList.tsx",
  "accounting\Accounting.tsx",
  "employees\EmployeesList.tsx",
  "inventory\Inventory.tsx",
  "manifests\Manifests.tsx",
  "tariffs\Tariffs.tsx",
  "audit\AuditLogs.tsx",
  "branches\Branches.tsx",
  "attendance\Attendance.tsx",
  "customer-portal\PortalDashboard.tsx",
  "customer-portal\PortalShipments.tsx",
  "customer-portal\PortalBilling.tsx",
  "customer-portal\PortalBalance.tsx"
)

foreach ($page in $pages) {
  $path = "src\pages\$page"
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  
  $name = (Split-Path $path -Leaf).Replace(".tsx", "")
  $content = "import React from 'react';`n`nconst ${name}: React.FC = () => {`n  return <div className='p-6'>${name}</div>;`n};`n`nexport default ${name};`n"
  
  Set-Content -Path $path -Value $content
}
