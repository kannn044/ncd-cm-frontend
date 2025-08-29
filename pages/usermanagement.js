import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { 
  AppBar, Toolbar, Typography, Button, Container, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
  TableSortLabel, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Select, MenuItem, FormControl, InputLabel, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const headCells = [
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions' },
  { id: 'NAME', numeric: false, disablePadding: false, label: 'NAME' },
  { id: 'HOSPCODE', numeric: false, disablePadding: false, label: 'HOSPCODE' },
  { id: 'CID', numeric: false, disablePadding: false, label: 'CID' },
  { id: 'CONTACT', numeric: false, disablePadding: false, label: 'CONTACT' },
  { id: 'ADDRESS', numeric: false, disablePadding: false, label: 'ADDRESS' },
  { id: 'STATUS', numeric: false, disablePadding: false, label: 'STATUS' },
];

const headCellsHosp = [
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions' },
  { id: 'HOSPCODE', numeric: false, disablePadding: false, label: 'HOSPCODE' },
  { id: 'NAME', numeric: false, disablePadding: false, label: 'NAME' },
  { id: 'HEADQUARTER', numeric: false, disablePadding: false, label: 'HEADQUARTER' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, columns = headCells } = props;
  const createSortHandler = (property) => () => onRequestSort(null, property);

  return (
    <TableHead>
      <TableRow>
        {columns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'actions' ? headCell.label : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  columns: PropTypes.array,
};

function UserManagement() {
  const [activeTab, setActiveTab] = useState(0);

  // Users state
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('d_update');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  // Hospitals state
  const [hospitals, setHospitals] = useState([]);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [pageHosp, setPageHosp] = useState(0);
  const [rowsPerPageHosp, setRowsPerPageHosp] = useState(5);
  const [orderHosp, setOrderHosp] = useState('asc');
  const [orderByHosp, setOrderByHosp] = useState('NAME');
  const [searchHosp, setSearchHosp] = useState('');
  const [debouncedSearchHosp, setDebouncedSearchHosp] = useState('');
  const [editingHospital, setEditingHospital] = useState(null);
  const [isEditHospDialogOpen, setEditHospDialogOpen] = useState(false);
  const [isAddHospDialogOpen, setAddHospDialogOpen] = useState(false);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: String(orderBy).toLowerCase(),
        order: order,
      };
      const s = String(debouncedSearchTerm || '').trim();
      if (s) params.search = s;

      const res = await axios.get('http://localhost:3011/api/cm-users', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setUsers(data);
      setTotalUsers(Number(res.data?.total || 0));
    } catch (err) {
      console.error(err);
      setUsers([]);
      setTotalUsers(0);
    }
  };

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem('token');
    const params = {
        page: pageHosp + 1,
        limit: rowsPerPageHosp,
        sort: String(orderByHosp).toUpperCase(),
        order: orderHosp,
      };
      const s = String(debouncedSearchHosp || '').trim();
      if (s) params.search = s;

      const res = await axios.get('http://localhost:3011/api/hospitals', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setHospitals(data);
      setTotalHospitals(Number(res.data?.total || 0));
    } catch (err) {
      console.error(err);
      setHospitals([]);
      setTotalHospitals(0);
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchHosp(searchHosp), 400);
    return () => clearTimeout(timerId);
  }, [searchHosp]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [router, page, rowsPerPage, debouncedSearchTerm, order, orderBy]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (activeTab === 1) fetchHospitals();
  }, [activeTab, pageHosp, rowsPerPageHosp, debouncedSearchHosp, orderHosp, orderByHosp]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Users handlers
  const handleRequestSort = (_event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };
  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };
  const handleSave = async (editedUser) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save the changes?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:3011/api/cm-users/${editedUser.ID}`, editedUser, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire('Saved!', 'User has been updated.', 'success');
          handleCloseDialog();
          fetchUsers();
        } catch (error) {
          Swal.fire(error?.response?.data?.message || 'Error updating user', '', 'error');
        }
      }
    });
  };
  const handleOpenAdd = () => setAddDialogOpen(true);
  const handleCloseAdd = () => setAddDialogOpen(false);
  const handleAddSave = async (newUser) => {
    Swal.fire({
      title: 'Create user?',
      text: 'Do you want to add this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Create',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3011/api/cm-users', newUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Created!', 'User has been added.', 'success');
        handleCloseAdd();
        setPage(0);
        fetchUsers();
      } catch (error) {
        Swal.fire(error?.response?.data?.message || 'Error creating user', '', 'error');
      }
    });
  };

  // Hospitals handlers
  const handleTabChange = (_e, v) => setActiveTab(v);

  const handleRequestSortHosp = (_event, property) => {
    const isAsc = orderByHosp === property && orderHosp === 'asc';
    setOrderHosp(isAsc ? 'desc' : 'asc');
    setOrderByHosp(property);
    setPageHosp(0);
  };
  const handleChangePageHosp = (_event, newPage) => setPageHosp(newPage);
  const handleChangeRowsPerPageHosp = (event) => {
    setRowsPerPageHosp(parseInt(event.target.value, 10));
    setPageHosp(0);
  };
  const handleSearchChangeHosp = (event) => {
    setSearchHosp(event.target.value);
    setPageHosp(0);
  };

  const handleEditClickHosp = (h) => {
    setEditingHospital(h);
    setEditHospDialogOpen(true);
  };
  const handleCloseHospDialog = () => {
    setEditHospDialogOpen(false);
    setEditingHospital(null);
  };

  const handleSaveHospital = async (edited) => {
    Swal.fire({
      title: 'Save changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Save'
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:3011/api/hospitals/${edited.HOSPCODE}`,
          { NAME: edited.NAME, HEADQUARTER: edited.HOSPCODE }, // HEADQUARTER same as HOSPCODE
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Saved!', 'Hospital has been updated.', 'success');
        handleCloseHospDialog();
        fetchHospitals();
      } catch (error) {
        Swal.fire(error?.response?.data?.message || 'Error updating hospital', '', 'error');
      }
    });
  };

  const handleOpenAddHosp = () => setAddHospDialogOpen(true);
  const handleCloseAddHosp = () => setAddHospDialogOpen(false);
  const handleAddSaveHosp = async (newHosp) => {
    Swal.fire({
      title: 'Create hospital?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Create'
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3011/api/hospitals', newHosp, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Created!', 'Hospital has been added.', 'success');
        handleCloseAddHosp();
        setPageHosp(0);
        fetchHospitals();
      } catch (error) {
        Swal.fire(error?.response?.data?.message || 'Error creating hospital', '', 'error');
      }
    });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Management
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Users" />
            <Tab label="Hospitals" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Search Users (server-side)"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Button variant="contained" onClick={handleOpenAdd}>Add User</Button>
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="users table">
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  columns={headCells}
                />
                <TableBody>
                  {users.map((user) => (
                    <StyledTableRow key={user.ID || `${user.HOSPCODE}-${user.CID}`}>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditClick(user)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{String(user.NAME ?? user.name ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(user.HOSPCODE ?? user.hospcode ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(user.CID ?? user.cid ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(user.CONTACT ?? user.contact ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(user.ADDRESS ?? user.address ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(user.STATUS ?? user.status ?? '').toUpperCase()}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalUsers}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { mb: 0 } }}
            />
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Search Hospitals (server-side)"
                variant="outlined"
                value={searchHosp}
                onChange={handleSearchChangeHosp}
              />
              <Button variant="contained" onClick={handleOpenAddHosp}>Add Hospital</Button>
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="hospitals table">
                <EnhancedTableHead
                  order={orderHosp}
                  orderBy={orderByHosp}
                  onRequestSort={handleRequestSortHosp}
                  columns={headCellsHosp}
                />
                <TableBody>
                  {hospitals.map((h) => (
                    <StyledTableRow key={h.HOSPCODE}>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditClickHosp(h)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{String(h.HOSPCODE ?? '').toUpperCase()}</TableCell>
                      <TableCell>{String(h.NAME ?? '').toUpperCase()}</TableCell>
                      {/* Show HEADQUARTER as same HOSPCODE (fallback to HOSPCODE if HEADQUARTER missing) */}
                      <TableCell>{String(h.HEADQUARTER ?? h.HOSPCODE ?? '').toUpperCase()}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalHospitals}
              rowsPerPage={rowsPerPageHosp}
              page={pageHosp}
              onPageChange={handleChangePageHosp}
              onRowsPerPageChange={handleChangeRowsPerPageHosp}
              sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { mb: 0 } }}
            />
          </Paper>
        )}
      </Container>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={isEditDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSave}
        />
      )}

      <AddUserDialog
        open={isAddDialogOpen}
        onClose={handleCloseAdd}
        onSave={handleAddSave}
      />

      {editingHospital && (
        <EditHospitalDialog
          hospital={editingHospital}
          open={isEditHospDialogOpen}
          onClose={handleCloseHospDialog}
          onSave={handleSaveHospital}
        />
      )}

      <AddHospitalDialog
        open={isAddHospDialogOpen}
        onClose={handleCloseAddHosp}
        onSave={handleAddSaveHosp}
      />
    </>
  );
}

function EditUserDialog({ user, open, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField margin="dense" name="NAME" label="Name" type="text" fullWidth variant="standard" value={editedUser.NAME || ''} onChange={handleChange} />
        <TextField margin="dense" name="HOSPCODE" label="Hospcode" type="text" fullWidth variant="standard" value={editedUser.HOSPCODE || ''} onChange={handleChange} />
        <TextField margin="dense" name="CID" label="CID" type="text" fullWidth variant="standard" value={editedUser.CID || ''} onChange={handleChange} />
        <TextField margin="dense" name="CONTACT" label="Contact" type="text" fullWidth variant="standard" value={editedUser.CONTACT || ''} onChange={handleChange} />
        <TextField margin="dense" name="ADDRESS" label="Address" type="text" fullWidth variant="standard" value={editedUser.ADDRESS || ''} onChange={handleChange} />
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select name="STATUS" value={editedUser.STATUS || ''} onChange={handleChange}>
            <MenuItem value="activate">Activate</MenuItem>
            <MenuItem value="deactivate">Deactivate</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(editedUser)}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddUserDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    hospcode: '',
    cid: '',
    contact: '',
    address: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ name: '', hospcode: '', cid: '', contact: '', address: '' });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isDigits = (s) => /^[0-9]*$/.test(s);
  const cidValid = form.cid.length === 13 && isDigits(form.cid);
  const hospValid = form.hospcode.length > 0 && isDigits(form.hospcode);
  const canSubmit =
    form.name.trim() &&
    hospValid &&
    cidValid &&
    form.contact.trim() &&
    form.address.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <TextField margin="dense" name="name" label="Name" type="text" fullWidth variant="standard" value={form.name} onChange={handleChange} />
        <TextField margin="dense" name="hospcode" label="Hospcode (digits only)" type="text" fullWidth variant="standard" value={form.hospcode} onChange={handleChange} error={!!form.hospcode && !hospValid} helperText={!!form.hospcode && !hospValid ? 'Digits 0-9 only' : ''} />
        <TextField margin="dense" name="cid" label="CID (13 digits)" type="text" fullWidth variant="standard" value={form.cid} onChange={handleChange} error={!!form.cid && !cidValid} helperText={!!form.cid && !cidValid ? 'CID must be exactly 13 digits' : ''} />
        <TextField margin="dense" name="contact" label="Contact" type="text" fullWidth variant="standard" value={form.contact} onChange={handleChange} />
        <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={form.address} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!canSubmit} onClick={() => onSave(form)}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

// Hospitals dialogs
function EditHospitalDialog({ hospital, open, onClose, onSave }) {
  const [form, setForm] = useState({
    HOSPCODE: hospital?.HOSPCODE || '',
    NAME: hospital?.NAME || '',
    HEADQUARTER: hospital?.HOSPCODE || '',
  });

  useEffect(() => {
    setForm({
      HOSPCODE: hospital?.HOSPCODE || '',
      NAME: hospital?.NAME || '',
      HEADQUARTER: hospital?.HOSPCODE || '',
    });
  }, [hospital]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // keep HEADQUARTER same as HOSPCODE
      if (name === 'HOSPCODE') next.HEADQUARTER = value;
      return next;
    });
  };

  const canSubmit = form.NAME.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Hospital</DialogTitle>
      <DialogContent>
        <TextField margin="dense" name="HOSPCODE" label="Hospcode" type="text" fullWidth variant="standard" value={form.HOSPCODE} onChange={handleChange} disabled />
        <TextField margin="dense" name="NAME" label="Name" type="text" fullWidth variant="standard" value={form.NAME} onChange={handleChange} />
        <TextField margin="dense" name="HEADQUARTER" label="Headquarter (Hospcode)" type="text" fullWidth variant="standard" value={form.HEADQUARTER} disabled />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!canSubmit} onClick={() => onSave(form)}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddHospitalDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({ hospcode: '', name: '' });

  useEffect(() => {
    if (open) setForm({ hospcode: '', name: '' });
  }, [open]);

  const isDigits = (s) => /^[0-9]+$/.test(s);
  const hospValid = isDigits(form.hospcode);
  const nameValid = form.name.trim().length > 0;
  const canSubmit = hospValid && nameValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = () => {
    onSave({
      hospcode: form.hospcode,
      name: form.name,
      headquarter: form.hospcode, // HEADQUARTER same as HOSPCODE
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Hospital</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="hospcode"
          label="Hospcode (digits only)"
          type="text"
          fullWidth
          variant="standard"
          value={form.hospcode}
          onChange={handleChange}
          error={!!form.hospcode && !hospValid}
          helperText={!!form.hospcode && !hospValid ? 'Digits 0-9 only' : ''}
        />
        <TextField
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={form.name}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!canSubmit} onClick={handleCreate}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

export default dynamic(() => Promise.resolve(UserManagement), { ssr: false });
