

export default async function testPage({params})
{
    const { param } = await params;

    const myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('woiii');
        }, 1000);
    });


    // Wait for the promise to resolve
    const result = await myPromise.then((res) => res);
    return (
        <div>
            <h1>Test Page</h1>
            <p>
                {
                    `The param value is: ${param}`
                }
            </p>
            <p>
                {
                    `The promise result is: ${result}`
                }
            </p>
        </div>
    )
}