import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    // {
    //     id: 2,
    //     label: 'MENUITEMS.DASHBOARDS.TEXT',
    //     icon: 'bx-home-circle',
    //     subItems: [
            {
                id: 2,
                label: 'Dashboard',
                link: '/dashboard',
                parentId: 2,
                icon: 'bx-home-circle',
            },
            {
                id: 3,
                label: 'Customer Creation',
                link: '/CustomerCreation',
                parentId: 1,
                icon: 'bx-user-check', // Represents invoice approval/decision
            },
            // {
            //     id:4 ,
            //     label: 'Invoice Layout',
            //     link: '/InvoiceLayout',
            //     parentId: 1,
            //     icon: 'bx bx-layout',
            // },
            {
                id:5,
                label: 'Invoice',
                link: '/Invoice',
                parentId: 1,
                icon: 'bx bx-plus',
            },
            
            {
                id: 6,
                label: 'Invoice Decision',
                link: '/InvoiceDecision',
                parentId: 1,
                icon: 'bx-sync', // Represents invoice approval/decision
            },
            {
                id:7 ,
                label: 'Invoice Reports',
                link: '/InvoiceReports',
                parentId: 1,
                icon: 'bx bx-spreadsheet',
            },
            {
                id: 8,
                label: 'User Creation',
                link: '/InvoiceUserCreation',
                parentId: 1,
                icon: 'bx bx-user-check',
            },
            {
                id: 9,
                label: 'Service Charges',
                link: '/ServiceCharges',
                parentId: 1,
                icon: 'bx bx-receipt',
            },
            

            // <i class="bx bx-user-plus"></i>  
            // <i class="bx bx-user-check"></i> 
            // <i class="bx bx-user-pin"></i>  

           
    //     ]
    // },
    // {
    //     id: 66,
    //     label: 'MENUITEMS.PAGES.TEXT',
    //     isTitle: true
    // },
    // {
    //     id: 67,
    //     label: 'MENUITEMS.AUTHENTICATION.TEXT',
    //     icon: 'bx-user-circle',
    //     subItems: [
    //         {
    //             id: 68,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN',
    //             link: '/auth/login',
    //             parentId: 67
    //         },
    //         {
    //             id: 69,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN2',
    //             link: '/auth/login-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 70,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER',
    //             link: '/auth/signup',
    //             parentId: 67
    //         },
    //         {
    //             id: 71,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER2',
    //             link: '/auth/signup-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 72,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD',
    //             link: '/auth/reset-password',
    //             parentId: 67
    //         },
    //         {
    //             id: 73,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD2',
    //             link: '/auth/recoverpwd-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 74,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN',
    //             link: '/pages/lock-screen-1',
    //             parentId: 67
    //         },
    //         {
    //             id: 75,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN2',
    //             link: '/pages/lock-screen-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 76,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL',
    //             link: '/pages/confirm-mail',
    //             parentId: 67
    //         },
    //         {
    //             id: 77,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL2',
    //             link: '/pages/confirm-mail-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 78,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION',
    //             link: '/pages/email-verification',
    //             parentId: 67
    //         },
    //         {
    //             id: 79,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION2',
    //             link: '/pages/email-verification-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 80,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION',
    //             link: '/pages/two-step-verification',
    //             parentId: 67
    //         },
    //         {
    //             id: 81,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION2',
    //             link: '/pages/two-step-verification-2',
    //             parentId: 67
    //         }
    //     ]
    // },
    // {
    //     id: 82,
    //     label: 'MENUITEMS.UTILITY.TEXT',
    //     icon: 'bx-file',
    //     subItems: [
    //         {
    //             id: 83,
    //             label: 'MENUITEMS.UTILITY.LIST.STARTER',
    //             link: '/pages/starter',
    //             parentId: 82
    //         },
    //         {
    //             id: 84,
    //             label: 'MENUITEMS.UTILITY.LIST.MAINTENANCE',
    //             link: '/pages/maintenance',
    //             parentId: 82
    //         },
    //         {
    //             id: 85,
    //             label: 'Coming Soon',
    //             link: '/pages/coming-soon',
    //             parentId: 82
    //         },
    //         {
    //             id: 86,
    //             label: 'MENUITEMS.UTILITY.LIST.TIMELINE',
    //             link: '/pages/timeline',
    //             parentId: 82
    //         },
    //         {
    //             id: 87,
    //             label: 'MENUITEMS.UTILITY.LIST.FAQS',
    //             link: '/pages/faqs',
    //             parentId: 82
    //         },
    //         {
    //             id: 88,
    //             label: 'MENUITEMS.UTILITY.LIST.PRICING',
    //             link: '/pages/pricing',
    //             parentId: 82
    //         },
    //         {
    //             id: 89,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR404',
    //             link: '/pages/404',
    //             parentId: 82
    //         },
    //         {
    //             id: 90,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR500',
    //             link: '/pages/500',
    //             parentId: 82
    //         },
    //     ]
    // },
    // {
    //     id: 143,
    //     label: 'MENUITEMS.MULTILEVEL.TEXT',
    //     icon: 'bx-share-alt',
    //     subItems: [
    //         {
    //             id: 144,
    //             label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.1',
    //             parentId: 143
    //         },
    //         {
    //             id: 145,
    //             label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.2',
    //             parentId: 143,
    //             subItems: [
    //                 {
    //                     id: 146,
    //                     label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.1',
    //                     parentId: 145,
    //                 },
    //                 {
    //                     id: 147,
    //                     label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.2',
    //                     parentId: 145,
    //                 }
    //             ]
    //         },
    //     ]
    // }
];

