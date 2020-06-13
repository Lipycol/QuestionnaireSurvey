import Register from '../components/Register'
import Login from '../components/Login'
import Edit from '../components/Edit'
import List from '../components/List'
import Check from '../components/Check'
import Bin from '../components/Bin'
import Data from '../components/Data'
import Hall from '../components/Hall'
import Fill from '../components/Fill'
import Alter from '../components/Alter'

let routes = [
    {
        path: '/',
        name: '',
        component: Login,
        hidden: true
    },
    {
        path: '/Register',
        name: 'Register',
        component: Register,
        hidden: true
    },
    {
        path: '/Edit',
        name: 'Edit',
        component: Edit,
        hidden: true
    },
    {
        path: '/List',
        name: 'List',
        component: List,
        hidden: true
    },
    {
        path: '/Check',
        name: 'Check',
        component: Check,
        hidden: true
    },
    {
        path: '/Bin',
        name: 'Bin',
        component: Bin,
        hidden: true
    },
    {
        path: '/Data',
        name: 'Data',
        component: Data,
        hidden: true
    },
    {
        path: '/Hall',
        name: 'Hall',
        component: Hall,
        hidden: true
    },
    {
        path: '/Fill',
        name: 'Fill',
        component: Fill,
        hidden: true
    },
    {
        path: '/Alter',
        name: 'Alter',
        component: Alter,
        hidden: true
    }
];

export default routes;
