Implement the following: 
- Improve the responsivness and UI / UX of the screen
- Implement the Filter toolbar component at @src/components/ui/filter-toolbar.tsx .
- Along with the Filter toolbar also implement  the useStorageFilter hook at @/src/hooks/useStorageFilter
- Implement the pageHeader config and sonfig should be similar like 
```
const pageHeaderConfig: PageHeaderConfig = {
    title: STUDENT_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} students` : "",
    actions: [
      {
        label: STUDENT_PAGE.buttons.addStudent,
        icon: <Plus size={14} />,
        onClick: () => router.push(STUDENT_ROUTES.createNew),
      },
    ],
  };
```
- Enable back button in the page Header

- Implement the RowAction component in the column as similar used in Student lisitng page at @src/app/students/page.tsx
- Implement the DataTable component only if normal Table is used and create Column based on the table column, and can take inspiration from the student page at @src/app/students/page.tsx