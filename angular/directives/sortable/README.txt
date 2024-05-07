<th class="text-end" sortValue="sn" (sort)="onSort($event)"><a class="sort-by"> Invoice Date </a></th>

.sort-by {
    position: relative;
    padding-right: 18px;
    cursor: pointer;

    &:before,
    &:after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid;
        position: absolute;
        right: 5px;
        color: #bcbdbe;
        right: 4px;
    }

    &:after {
        transform: rotate(180deg);
        margin-top: -8px;
    }

    &:before {
        margin-top: 2px;
    }

    &.asc:before,
    &.desc:after {
        color: black;
    }

    &.asc:after,
    &.desc:before {
        color: #bcbdbe;
    }

    &.none:before,
    &.none:after {
        color: #bcbdbe;
    }
}

