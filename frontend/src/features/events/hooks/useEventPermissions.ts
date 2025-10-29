export const useEventPermissions = (event: any) => {
    const canEdit = event?.can_edit === 1;
    const canDelete = event?.can_edit === 1;
    const canView = true;

    return { canEdit, canDelete, canView };
};
