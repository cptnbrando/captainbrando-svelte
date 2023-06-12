<div id="scroll-container">
    <a href="mailto:captainbrandooo@gmail.com?Subject=Hello!" target="_blank">
        <div id="scroll-text">
            ⛵ Captain Brando! ⛵ captainbrandooo@gmail.com ⛵ Message Me Sometime ⛵ brando was here ⛵ 
            captainbrandooo@gmail.com ⛵ Captain Brando! ⛵ Call Me Sometime ⛵ @captainbrandooo ⛵
            captainbrandooo@gmail.com ⛵ DM Me Sometime ⛵ @captainbrandooo ⛵ 
            captainbrandooo@gmail.com ⛵ brando was here ⛵ Text Me Sometime ⛵ @captainbrandooo ⛵
            captainbrandooo@gmail.com ⛵ Captain Brando! ⛵ Call Me Sometime ⛵ @captainbrandooo ⛵
        </div>
    </a>
</div>

<style lang="scss">
    #scroll-container {
        border: 3px solid black;
        border-radius: 5px;
        overflow: hidden;
        font-size: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        transition: 0.5s;

        &:hover {
            border-color: red;
        }

        a {
            transition: 0.5s;
            color: black;

            &:hover {
                color: red;
            }
        }
    }

    $width: 50%;
    $time: 150s;

    #scroll-text {
        white-space: nowrap;
        /* animation properties */
        -moz-transform: translateX($width);
        -webkit-transform: translateX($width);
        transform: translateX($width);

        -moz-animation: my-animation $time linear infinite;
        -webkit-animation: my-animation $time linear infinite;
        animation: my-animation $time linear infinite;
    }


    /* for Firefox */
    @-moz-keyframes my-animation {
        from {
            -moz-transform: translateX($width);
        }

        to {
            -moz-transform: translateX(-$width);
        }
    }

    /* for Chrome */
    @-webkit-keyframes my-animation {
        from {
            -webkit-transform: translateX($width);
        }

        to {
            -webkit-transform: translateX(-$width);
        }
    }

    @keyframes my-animation {
        from {
            -moz-transform: translateX($width);
            -webkit-transform: translateX($width);
            transform: translateX($width);
        }

        to {
            -moz-transform: translateX(-$width);
            -webkit-transform: translateX(-$width);
            transform: translateX(-$width);
        }
    }
</style>