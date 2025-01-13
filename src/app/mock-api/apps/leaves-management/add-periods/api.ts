import { Injectable } from '@angular/core';
import { QbsMockApiService } from '@qbs/lib/mock-api';
// 
import { leavePeriodsData  } from 'app/mock-api/apps/leaves-management/add-periods/data';
// 
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class LeavesManagementMockApi {
    // private _products: any[] = productsData;
    private _leavePeriods: any[] = leavePeriodsData;

    /**
     * Constructor
     */
    constructor(private _qbsMockApiService: QbsMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ LEAVE PERIODS - GET
        // -----------------------------------------------------------------------------------------------------
        this._qbsMockApiService
            // .onGet('api/apps/ecommerce/inventory/products', 300)

            .onGet('api/apps/leaves-management/add-periods/leave-periods', 300)  //  300 ? DELAY IN MILLISECONDS
            .reply(({ request }) => {

                // GET AVAILABLE QUERIES
                const search = request.params.get('search');
                const sort = request.params.get('sort') || 'from_date';
                const order = request.params.get('order') || 'asc';
                const page = parseInt(request.params.get('page') ?? '1', 10);
                const size = parseInt(request.params.get('size') ?? '10', 10);


                // CLONE THE LEAVE PERIODS
                let leavePeriods: any[] | null = cloneDeep(this._leavePeriods);

                // SORT THE LEAVE PERIODS
                if (sort === 'from_date' || sort === 'to_date' || sort === 'active') {
                    leavePeriods.sort((a, b) => {
                        const fieldA = a[sort].toString();
                        const fieldB = b[sort].toString();
                        return order === 'asc'
                            ? fieldA.localeCompare(fieldB)
                            : fieldB.localeCompare(fieldA);
                    });
                }

                // IF SEARCH EXISTS...
                // FILTER THE LEAVE PERIODS
                if (search) {
                    leavePeriods = leavePeriods.filter(
                        (period) =>
                            period.from_date.includes(search) ||
                            period.to_date.includes(search) ||
                            period.id.includes(search)
                    );
                }

                /*
                if (search) {
                    leavePeriods = leavePeriods.filter(period =>
                        period.from_date.includes(search) ||
                        period.to_date.includes(search) ||
                        period.id.includes(search)
                    );
                }
                */


                // PAGINATE - START
                const leavePeriodsLength = leavePeriods.length;

                // CALCULATE PAGINATION DETAILS
                const begin = (page - 1) * size;
                const end = Math.min(size * page, leavePeriodsLength);
                const lastPage = Math.max(Math.ceil(leavePeriodsLength / size), 1);


                // PREPARE THE PAGINATION OBJECT
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // leave periods but also send the last possible page so
                // the app can navigate to there

                if (page > lastPage) {
                    leavePeriods = null;
                    pagination = {
                        lastPage,
                    };
                } else {
                    // PAGINATE THE RESULTS BY SIZE
                    leavePeriods = leavePeriods.slice(begin, end);

                    // PREPARE THE PAGINATION MOCK-API
                    pagination = {
                        length: leavePeriodsLength,
                        size: size,
                        page: page,
                        lastPage: lastPage,
                        startIndex: begin,
                        endIndex: end - 1,
                    };
                }

                // RETURN THE RESPONSE
                return [
                    200,
                    {
                        leavePeriods,
                        pagination,
                    },
                ];
                // return [200, { leavePeriods, pagination }];
                //  200 ?  HTTP SUCCESS STATUS CODE  
            });
        // -----------------------------------------------------------------------------------------------------
        // @ Product - GET
        // -----------------------------------------------------------------------------------------------------
        // @ POST
        // -----------------------------------------------------------------------------------------------------
        // @ PATCH
        // -----------------------------------------------------------------------------------------------------
        // @ DELETE
        // -----------------------------------------------------------------------------------------------------
        // -----------------------------------------------------------------------------------------------------
        // @ Tag - DELETE
        // -----------------------------------------------------------------------------------------------------

    }
}
